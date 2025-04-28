import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
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
      console.warn('⚠️ No se encontró ningún perfil para el usuario:', userId);
      return null;
    }

    // ✅ Aseguramos que siempre sean arrays para evitar errores de renderizado
    return {
      ...profile,
      games: Array.isArray(profile.games) ? profile.games : [],
      categories: Array.isArray(profile.categories) ? profile.categories : [],
      stream_start_time: profile.stream_start_time || '',
      stream_end_time: profile.stream_end_time || '',
    };
  } catch (error) {
    console.error('❌ Error inesperado en fetchUserProfile:', error);
    return null;
  }
};
