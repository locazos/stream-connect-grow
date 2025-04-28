import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { createUserProfile } from '@/lib/createUserProfile';
import { fetchUserProfile } from '@/lib/fetchUserProfile';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleProfile = async (user: User) => {
      try {
        let profile = await fetchUserProfile(user.id);

        if (!profile) {
          console.log('⚡ No existe perfil, creando uno nuevo...');
          profile = await createUserProfile(user);
        }

        if (profile) {
          setProfile(profile);
        } else {
          console.error('❌ No se pudo cargar o crear perfil');
        }
      } catch (error) {
        console.error('❌ Error en handleProfile:', error);
      } finally {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        await handleProfile(session.user);
      } else {
        setProfile(null);
      }
    });

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        await handleProfile(session.user);
      } else {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { session, user, profile, loading };
};
