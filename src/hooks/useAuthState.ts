
// hooks/useAuthState.ts

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { createUserProfile } from '@/lib/createUserProfile';
import { fetchUserProfile } from '@/lib/auth';
import type { Database } from '@/lib/database.types';
import { Session, User } from '@supabase/supabase-js';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useAuthState = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleProfileFetch = async (user: User) => {
      try {
        console.log("🔍 Fetching user profile for:", user.id);
        const profileData = await fetchUserProfile(user.id);
        
        if (!profileData) {
          console.log("🔄 No profile found, creating a new one...");
          const newProfile = await createUserProfile(user);
          if (newProfile) {
            setProfile(newProfile);
            console.log("✅ New profile created successfully");
          } else {
            console.error("❌ Failed to create new profile");
          }
        } else {
          console.log("✅ Profile found:", profileData);
          setProfile(profileData);

          // Check if profile is incomplete and redirect to complete-profile if needed
          if (!profileData.description || !profileData.games?.length) {
            console.log("🚀 Profile incomplete, redirecting to complete-profile");
            navigate("/complete-profile");
          }
        }
      } catch (error) {
        console.error("❌ Error handling profile:", error);
      }
    };

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log("👂 Auth state changed:", _event);
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          await handleProfileFetch(currentSession.user);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // Then check for initial session
    const getInitialSession = async () => {
      try {
        console.log("🔍 Getting initial session...");
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession?.user) {
          console.log("✅ Initial session found for user:", initialSession.user.id);
          setSession(initialSession);
          setUser(initialSession.user);
          await handleProfileFetch(initialSession.user);
        } else {
          console.log("ℹ️ No initial session found");
        }
      } catch (error) {
        console.error("❌ Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log("🧹 Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { session, user, profile, loading };
};
