
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Use direct values since environment variables aren't available
const supabaseUrl = "https://vafynmudxzjojvuzaeoq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZnlubXVkeHpqb2p2dXphZW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NzAzMTksImV4cCI6MjA2MDU0NjMxOX0._GTTgiA5wbougH2h-9AIS2o1NFPLKMr6lsBjzZONLmc";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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
    const { data, error } = await supabase.rpc('create_match', {
      user_1: userId,
      user_2: targetId,
    });
    
    if (error) {
      console.error('Error creating match:', error);
      return false;
    }
    
    console.log('Match created successfully', data);
    return true;
  } catch (error) {
    console.error('Error in createMatch:', error);
    return false;
  }
}
