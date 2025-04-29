// Import the client from the integration file
import { supabase } from '@/integrations/supabase/client';

// Export the client for use throughout the application
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
    
    // First, try the RPC method to create the match
    console.log('Trying to create match with RPC method first');
    const { data: rpcResult, error: rpcError } = await supabase.rpc('create_match', {
      input_user_1: userId,
      input_user_2: targetId
    });
    
    if (rpcError) {
      console.error('Error creating match with RPC:', rpcError);
      
      // If RPC method fails, try direct insertion
      console.log('RPC method failed, trying direct insertion');
      
      // First, check if the match already exists
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
        return false;
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
    }
    
    console.log('Match created successfully with RPC:', rpcResult);
    
    // Verify the match was created with RPC method
    const { data: verifyMatch, error: verifyError } = await supabase
      .from('matches')
      .select('*')
      .eq('user_a', userA)
      .eq('user_b', userB)
      .maybeSingle();
      
    if (verifyError) {
      console.error('Error verifying match creation after RPC:', verifyError);
    } else if (!verifyMatch) {
      console.error('Match was not found after RPC creation!');
      
      // Fallback: Try direct insertion if RPC succeeded but match not found
      console.log('Match not found after RPC, trying direct insertion as fallback');
      const { data: insertedMatch, error: insertError } = await supabase
        .from('matches')
        .insert({
          user_a: userA,
          user_b: userB
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error in fallback direct insertion:', insertError);
        return false;
      }
      
      console.log('Match created with fallback direct insertion:', insertedMatch);
    } else {
      console.log('Match creation with RPC verified:', verifyMatch);
    }
    
    return true;
  } catch (error) {
    console.error('Error in createMatch:', error);
    return false;
  }
}
