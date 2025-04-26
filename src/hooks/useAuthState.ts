import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { createUserProfile } from '@/lib/createUserProfile';
import { useToast } from '@/components/ui/use-toast';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching profile:', error.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Error inesperado en fetchProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          // Creamos el perfil si no existe
          await createUserProfile(session.user);

          // Cargamos el perfil
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('❌ Error inicializando sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          await createUserProfile(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { session, user, profile, loading };
};
