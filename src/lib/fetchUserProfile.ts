import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Fetch a user profile from Supabase
 * @param userId - The ID of the user
 * @returns The user profile or null
 */
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching profile:', error.message);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('❌ Unexpected error fetching profile:', error);
    return null;
  }
};
