
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Importar el cliente de Supabase desde el archivo generado automáticamente
import { supabase } from '@/integrations/supabase/client';

// Exportar el cliente de Supabase para ser utilizado en toda la aplicación
export { supabase };

// Helper function to test if a swipe creates a match
export async function testForMatch(swiperId: string, targetId: string): Promise<boolean> {
  console.log(`Testing for match between ${swiperId} and ${targetId}`);
  
  try {
    // Check if the target has already swiped right on the current user
    const { data, error } = await supabase
      .from('swipes')
      .select('*')
      .eq('swiper_id', targetId)
      .eq('target_id', swiperId)
      .eq('direction', 'right')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is the error code for no rows returned
      console.error('Error checking for match:', error);
      return false;
    }
    
    // If we found a row, it means the other user already swiped right
    const isMatch = !!data;
    console.log('Is match?', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error in testForMatch:', error);
    return false;
  }
}

// Function to create a match if there's reciprocity
export async function createMatch(userId: string, targetId: string): Promise<boolean> {
  console.log(`Creating match between ${userId} and ${targetId}`);
  
  try {
    // Determine the correct order for user_a and user_b (smaller UUID first)
    let userA: string, userB: string;
    if (userId < targetId) {
      userA = userId;
      userB = targetId;
    } else {
      userA = targetId;
      userB = userId;
    }
    
    console.log('Creating match with ordered parameters:', { user_a: userA, user_b: userB });
    
    // First, check if the match already exists using parameterized query
    const { data: existingMatch, error: checkError } = await supabase
      .from('matches')
      .select('*')
      .eq('user_a', userA)
      .eq('user_b', userB)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing match:', checkError);
      return false;
    }
    
    if (existingMatch) {
      console.log('Match already exists:', existingMatch);
      return true;
    }
    
    // Try to insert the match directly
    console.log('Inserting new match with:', { user_a: userA, user_b: userB });
    const { data: insertedMatch, error: insertError } = await supabase
      .from('matches')
      .insert({
        user_a: userA,
        user_b: userB
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating match directly:', insertError);
      
      // If direct insertion fails, try using the RPC function as fallback
      console.log('Direct insertion failed, trying RPC method');
      const { data: rpcResult, error: rpcError } = await supabase.rpc('create_match', {
        user_1: userId,
        user_2: targetId
      });
      
      if (rpcError) {
        console.error('Error creating match with RPC:', rpcError);
        throw new Error(`Failed to create match: ${rpcError.message}`);
      }
      
      console.log('Match created successfully with RPC:', rpcResult);
      return true;
    }
    
    console.log('Match created successfully directly:', insertedMatch);
    
    // Double-check that the match was actually created
    const { data: verifyMatch, error: verifyError } = await supabase
      .from('matches')
      .select('*')
      .eq('user_a', userA)
      .eq('user_b', userB)
      .maybeSingle();
      
    if (verifyError) {
      console.error('Error verifying match creation:', verifyError);
    } else if (!verifyMatch) {
      console.error('Match was not found after creation attempt!');
      return false;
    } else {
      console.log('Match creation verified:', verifyMatch);
    }
    
    return true;
  } catch (error) {
    console.error('Error in createMatch:', error);
    return false;
  }
}
