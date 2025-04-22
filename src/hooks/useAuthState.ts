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
    const handleProfileFetch = async (user: User, session: Session) => {
      const profile = await fetchUserProfile(user.id);
      console.log("🔍 Resultado de fetchUserProfile:", profile);
    
      if (!profile) {
        console.log("🟨 No profile found for user");
        console.log("📦 session:", session);
        console.log("🧑 user:", user);
    
        console.log("🚀 Ejecutando createUserProfile con ID:", user.id);
        const newProfile = await createUserProfile(user);
        console.log("✅ Resultado de createUserProfile:", newProfile);
        setProfile(newProfile);
      } else {
        console.log("✅ Perfil encontrado:", profile);
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
            if (session?.user) {
              handleProfileFetch(session.user, session);
            }
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
          await handleProfileFetch(session.user, session);
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
