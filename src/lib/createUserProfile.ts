import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const createUserProfile = async (user: User): Promise<Profile | null> => {
  try {
    const { id, user_metadata } = user;
    const username = user_metadata?.preferred_username || user_metadata?.full_name || 'streamer';
    const avatarUrl = user_metadata?.avatar_url || null;
    const twitchId = user_metadata?.provider_id || null;
    const twitchUrl = username ? `https://www.twitch.tv/${username}` : null;

    console.log("🛠️ Creando perfil con:", { id, username, avatarUrl, twitchId, twitchUrl });

    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id,
          username,
          avatar_url: avatarUrl,
          description: '',
          games: [],
          categories: [],
          stream_start_time: null,
          stream_end_time: null,
          twitch_id: twitchId,
          twitch_url: twitchUrl,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando perfil:', error.message);
      return null;
    }

    console.log('✅ Perfil creado:', data);
    return data;
  } catch (error) {
    console.error('❌ Error inesperado en createUserProfile:', error);
    return null;
  }
};
