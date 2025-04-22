
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { createUserProfile, fetchUserProfile } from '@/lib/auth.ts';
console.log("🧠 createUserProfile importado correctamente:", createUserProfile);

import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useAuthState = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const handleProfileFetch = async (userId: string) => {
      const profile = await fetchUserProfile(userId);
      if (!profile) {
        console.log("🔄 No se encontró perfil, creando uno nuevo...");
        if (session?.user) {
          const newProfile = await createUserProfile(session.user);
          setProfile(newProfile);
        }
      } else {
        setProfile(profile);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);

        // 👇 Este es el log que necesitas añadir
    console.log("🧑 Sesión detectada, user:", session?.user);
        
        if (session?.user) {
          setTimeout(() => {
            handleProfileFetch(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setSession(session);
          setUser(session.user);
          await handleProfileFetch(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
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
