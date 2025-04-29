
// hooks/useAuthState.ts

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { createUserProfile, fetchUserProfile } from '@/lib/auth';
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
    console.log("🔍 Getting initial session...");
    
    const handleProfileFetch = async (user: User) => {
      console.log("👤 Fetching profile for user:", user.id);
      try {
        const profileData = await fetchUserProfile(user.id);
        
        if (!profileData) {
          console.log("🔄 No profile found, creating a new one...");
          const newProfile = await createUserProfile(user);
          if (newProfile) {
            console.log("✅ New profile created:", newProfile.username);
            setProfile(newProfile);
          } else {
            console.error("❌ Failed to create profile");
          }
        } else {
          console.log("✅ Profile found:", profileData.username);
          setProfile(profileData);
        }
      } catch (error) {
        console.error("❌ Error in handleProfileFetch:", error);
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("👂 Auth state changed:", event, newSession?.user?.id);
        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          console.log("🔑 User is logged in:", newSession.user.email);
          await handleProfileFetch(newSession.user);
        } else {
          console.log("❌ No user session found");
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession?.user) {
          console.log("✅ Found initial session:", initialSession.user.email);
          setSession(initialSession);
          setUser(initialSession.user);
          await handleProfileFetch(initialSession.user);
        } else {
          console.log("ℹ️ No initial session found");
        }
      } catch (error) {
        console.error('❌ Error getting initial session:', error);
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
