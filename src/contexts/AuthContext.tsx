
import { createContext, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/useAuthState';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signInWithTwitch: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { session, user, profile, loading } = useAuthState();

  const signInWithTwitch = async () => {
    try {
      console.log("🔑 Starting Twitch login...");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitch',
        options: {
          redirectTo: `${window.location.origin}/login`,
        },
      });
      
      if (error) {
        console.error("❌ Twitch login error:", error);
      } else {
        console.log("✅ Twitch login initiated successfully");
      }
      
      return { error };
    } catch (error) {
      console.error('❌ Error in signInWithTwitch:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    console.log("🚪 Signing out...");
    await supabase.auth.signOut();
    console.log("✅ Sign out complete");
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
