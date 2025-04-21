
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import useStore from '@/store/useStore';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any;
  signInWithTwitch: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const { session, user, profile, setSession, setUser, setProfile } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Initializing auth state...");
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state change: ${event}`);
        
        // Synchronous state updates first
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          // Defer profile fetch to avoid deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Then check for existing session
    const getInitialSession = async () => {
      try {
        console.log("Getting initial session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Initial session found");
          setSession(session);
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          console.log("No initial session found");
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
  }, [navigate, setSession, setUser, setProfile]);

  // Fetch profile data from the profiles table
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log(`Fetching profile for user ${userId}`);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (!profile) {
        console.log("No profile found, creating one");
        await createUserProfile(userId);
      } else {
        console.log("Profile found:", profile);
        setProfile(profile);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  // Create a new profile from Twitch metadata
  const createUserProfile = async (userId: string) => {
    try {
      console.log(`Creating profile for user ${userId}`);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        console.error('No user data available');
        return;
      }
      
      const user = userData.user;
      const userMetadata = user.user_metadata;
      
      console.log('User metadata:', userMetadata);
      
      // Extract Twitch data from user metadata
      const username = userMetadata?.full_name || userMetadata?.preferred_username || 'streamer';
      const avatarUrl = userMetadata?.avatar_url || null;
      const twitchId = userMetadata?.provider_id || null;
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username,
          avatar_url: avatarUrl,
          twitch_id: twitchId,
          games: [],
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating profile:', error);
      } else {
        console.log("Profile created:", data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  };

  // Sign in with Twitch
  const signInWithTwitch = async () => {
    try {
      console.log('Signing in with Twitch...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitch',
        options: {
          redirectTo: `${window.location.origin}/login`,
        },
      });
      
      return { error };
    } catch (error) {
      console.error('Error in signInWithTwitch:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    console.log("Signing out user");
    await supabase.auth.signOut();
    navigate('/login');
  };

  const value = {
    session,
    user,
    profile,
    signInWithTwitch,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
