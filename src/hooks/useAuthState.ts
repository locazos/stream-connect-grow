
// hooks/useAuthState.ts

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Changed from next/router to react-router-dom
import { supabase } from '@/integrations/supabase/client';
import { createUserProfile } from '@/lib/auth'; // Fixed import
import { fetchUserProfile } from '@/lib/auth'; // Fixed import
import type { Database } from '@/lib/database.types';
import { Session, User } from '@supabase/supabase-js';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useAuthState = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate(); // Changed from router to navigate

  useEffect(() => {
    console.log("🔍 Getting initial session...");
    
    const handleProfileFetch = async (user: User) => {
      console.log("👤 Fetching profile for user:", user.id);
      const profileData = await fetchUserProfile(user.id);
      if (!profileData) {
        console.log("🔄 No hay perfil, creando uno nuevo...");
        const newProfile = await createUserProfile(user);
        if (newProfile) {
          setProfile(newProfile);
        }
      } else {
        setProfile(profileData);

        // Si no tiene descripción o juegos, redirigir a completar perfil
        if (!profileData.description || !profileData.games?.length) {
          console.log("🚀 Perfil incompleto, redirigiendo...");
          navigate("/setup-profile"); // Changed from router.push to navigate
        }
      }
    };

    console.log("👂 Auth state changed: INITIAL_SESSION");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("👂 Auth state changed:", _event, session?.user?.id);
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          console.log("🔑 User is logged in:", session.user.email);
          await handleProfileFetch(session.user);
        } else {
          console.log("❌ No user session found");
          setProfile(null);
        }

        setLoading(false);
      }
    );

    const getInitialSession = async () => {
      console.log("🔍 Getting initial session...");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log("✅ Found initial session:", session.user.email);
          setSession(session);
          setUser(session.user);
          await handleProfileFetch(session.user);
        } else {
          console.log("ℹ️ No initial session found");
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log("🧹 Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate]); // Changed from router to navigate

  return { session, user, profile, loading };
};
