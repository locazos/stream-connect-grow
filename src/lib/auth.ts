import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

// ✅ Crear nuevo perfil si no existe
export const createUserProfile = async (user: User): Promise<Profile | null> => {
  try {
    const userMetadata = user.user_metadata;
    const username = userMetadata?.full_name || userMetadata?.preferred_username || 'streamer';
    const avatarUrl = userMetadata?.avatar_url || null;
    const twitchId = userMetadata?.provider_id || null;

    console.log("🆕 Intentando crear perfil con:", {
      id: user.id,
      username,
      avatarUrl,
      twitchId,
      created_at: new Date().toISOString()
    });

    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          username,
          avatar_url: avatarUrl,
          description: '',
          games: [],
          twitch_id: twitchId,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando perfil:', error);
      return null;
    }

    console.log("✅ Perfil creado correctamente:", data);
    return data;
  } catch (error) {
    console.error('❌ Error inesperado en createUserProfile:', error);
    return null;
  }
};

// ✅ Buscar perfil por ID
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    console.log('🔍 fetchUserProfile query result:', profile, error);

    if (error) {
      console.error('❌ Error al obtener el perfil:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('❌ Error inesperado en fetchUserProfile:', error);
    return null;
  }
};
