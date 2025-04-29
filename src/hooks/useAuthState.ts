
// hooks/useAuthState.ts

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Replace next/router with react-router-dom
import { supabase } from '@/integrations/supabase/client';
import { createUserProfile, fetchUserProfile } from '@/lib/createUserProfile';
import type { Database } from '@/lib/database.types';
import { Session, User } from '@supabase/supabase-js';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useAuthState = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate(); // 👈 Using useNavigate from react-router-dom

  useEffect(() => {
    const handleProfileFetch = async (user: User) => {
      const profileData = await fetchUserProfile(user.id);
      if (!profileData) {
        console.log("🔄 No hay perfil, creando uno nuevo...");
        const newProfile = await createUserProfile(user);
        if (newProfile) {
          setProfile(newProfile);
        }
      } else {
        setProfile(profileData);

        // 👉 Si no tiene descripción o juegos, redirigir a completar perfil
        if (!profileData.description || !profileData.games?.length) {
          console.log("🚀 Perfil incompleto, redirigiendo...");
          navigate("/complete-profile"); // 👈 Use navigate instead of router.push
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          await handleProfileFetch(session.user);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          await handleProfileFetch(session.user);
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
  }, [navigate]); // 👈 Add navigate to the dependency array

  return { session, user, profile, loading };
};
