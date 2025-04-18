
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import useStore from '@/store/useStore';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const { setSession, setUser, setProfile } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Initializing auth state...");
    // Set up auth state listener first to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state change: ${event}`);
        
        // Synchronous state updates
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
        
        // Handle navigation
        if (event === 'SIGNED_IN') {
          navigate('/');
        } else if (event === 'SIGNED_OUT') {
          navigate('/login');
        }
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
          
          // Fetch user profile
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log("No profile found, creating one");
          // No profile found, create one
          await createUserProfile(userId);
        } else {
          console.error('Error fetching profile:', error);
        }
      } else {
        console.log("Profile found:", data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  // Create a new profile if one doesn't exist
  const createUserProfile = async (userId: string) => {
    try {
      console.log(`Creating profile for user ${userId}`);
      // Get user email from auth
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email || '';
      // Generate a username from the email
      const username = email.split('@')[0];
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username,
          games: [],
          avatar_url: null,
          description: '',
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

  const signUp = async (email: string, password: string) => {
    try {
      console.log(`Signing up user with email ${email}`);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      return { error };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log(`Signing in user with email ${email}`);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    console.log("Signing out user");
    await supabase.auth.signOut();
  };

  const value = {
    session: useStore.getState().session,
    user: useStore.getState().user,
    signUp,
    signIn,
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
