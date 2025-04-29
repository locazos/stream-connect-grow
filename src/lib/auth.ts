
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

// ✅ Fetch user profile by ID
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log("🔍 Fetching profile for user:", userId);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error loading profile:', error.message);
      return null;
    }

    if (!profile) {
      console.warn('⚠️ No profile found for user:', userId);
      return null;
    }

    // ✅ Ensure arrays are properly initialized
    return {
      ...profile,
      games: Array.isArray(profile.games) ? profile.games : [],
      categories: Array.isArray(profile.categories) ? profile.categories : [],
      stream_days: Array.isArray(profile.stream_days) ? profile.stream_days : [],
      start_time: profile.start_time || '',
      end_time: profile.end_time || '',
    };
  } catch (error) {
    console.error('❌ Unexpected error in fetchUserProfile:', error);
    return null;
  }
};

// ✅ Create new profile for a user
export const createUserProfile = async (user: User): Promise<Profile | null> => {
  try {
    console.log("➡️ Creating new profile for user:", user.id);

    const userMetadata = user.user_metadata;
    const username = userMetadata?.full_name || userMetadata?.preferred_username || 'streamer';
    const avatarUrl = userMetadata?.avatar_url || null;
    const twitchId = userMetadata?.provider_id || null;
    const twitchUrl = userMetadata?.custom_claims?.provider === 'twitch' ? 
      `https://twitch.tv/${userMetadata?.preferred_username || ''}` : null;

    console.log("📝 Profile data:", { username, avatarUrl, twitchId, twitchUrl });

    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          username,
          avatar_url: avatarUrl,
          description: '',
          games: [],
          categories: [],
          stream_days: [],
          twitch_id: twitchId,
          twitch_url: twitchUrl,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating profile:', error.message);
      return null;
    }

    console.log("✅ Profile created successfully:", data);
    return data;
  } catch (error) {
    console.error('❌ Unexpected error in createUserProfile:', error);
    return null;
  }
};
