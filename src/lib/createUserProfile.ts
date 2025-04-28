import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const createUserProfile = async (user: User): Promise<Profile | null> => {
  try {
    console.log("➡️ Entrando en createUserProfile");

    const userMetadata = user.user_metadata;
    const username = userMetadata?.full_name || userMetadata?.preferred_username || 'streamer';
    const avatarUrl = userMetadata?.avatar_url || null;
    const twitchId = userMetadata?.provider_id || null;

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
          stream_start_time: '',
          stream_end_time: '',
          twitch_id: twitchId,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando perfil:', error.message);
      return null;
    }

    console.log("✅ Perfil creado correctamente:", data);
    return data;
  } catch (error) {
    console.error('❌ Error inesperado en createUserProfile:', error);
    return null;
  }
};