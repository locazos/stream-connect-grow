
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  session: null | any;
  user: null | any;
  profile: null | Profile;
  
  // Actions
  setSession: (session: any) => void;
  setUser: (user: any) => void;
  setProfile: (profile: Profile | null) => void;
}

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        // State
        session: null,
        user: null,
        profile: null,
        
        // Actions
        setSession: (session) => set({ session }),
        setUser: (user) => set({ user }),
        setProfile: (profile) => set({ profile }),
      }),
      { name: 'stream-match-auth-storage' }
    )
  )
);

export default useAuthStore;
