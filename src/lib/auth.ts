
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const createUserProfile = async (user: User): Promise<Profile | null> => {
  try {
    const userMetadata = user.user_metadata;
    const username = userMetadata?.full_name || userMetadata?.preferred_username || 'streamer';
    const avatarUrl = userMetadata?.avatar_url || null;
    const twitchId = userMetadata?.provider_id || null;
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username,
        avatar_url: avatarUrl,
        description: '',
        games: [],
        twitch_id: twitchId,
        created_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();
      if (!data) {
        console.warn('⚠️ No se pudo crear el perfil (quizás ya existe o no se insertó)');
      }
      
    
      
    if (error) {
      console.log('🧩 createUserProfile insert result:', data, error);
      console.error('Error creating profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return null;
  }
};

export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
      console.log('🔍 fetchUserProfile query result:', profile, error);
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return profile;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};
