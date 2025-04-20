
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
    // Añadir más logs para solucionar el problema
    console.log('Creating match with parameters:', { user_1: userId, user_2: targetId });
    
    // Verificar si el match ya existe antes de intentar crearlo
    const { data: existingMatch, error: checkError } = await supabase
      .from('matches')
      .select('*')
      .or(`and(user_a.eq.${userId},user_b.eq.${targetId}),and(user_a.eq.${targetId},user_b.eq.${userId})`)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing match:', checkError);
      return false;
    }
    
    if (existingMatch) {
      console.log('Match already exists:', existingMatch);
      return true; // El match ya existe, así que consideramos que se creó correctamente
    }
    
    // Intentar crear el match directamente sin usar RPC
    // Esto nos puede dar más información sobre posibles errores
    let userA, userB;
    if (userId < targetId) {
      userA = userId;
      userB = targetId;
    } else {
      userA = targetId;
      userB = userId;
    }
    
    const { data: directData, error: directError } = await supabase
      .from('matches')
      .insert({
        user_a: userA,
        user_b: userB
      })
      .select()
      .single();
    
    if (directError) {
      console.error('Error creating match directly:', directError);
      
      // Intentar con RPC como fallback
      console.log('Trying with RPC method as fallback');
      const { data, error } = await supabase.rpc('create_match', {
        user_1: userId,
        user_2: targetId,
      });
      
      if (error) {
        console.error('Error creating match with RPC:', error);
        return false;
      }
      
      console.log('Match created successfully with RPC:', data);
      return true;
    }
    
    console.log('Match created successfully directly:', directData);
    return true;
  } catch (error) {
    console.error('Error in createMatch:', error);
    return false;
  }
}
