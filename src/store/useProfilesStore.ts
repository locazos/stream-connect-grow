
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfilesState {
  profiles: Profile[];
  currentProfileIndex: number;
  isLoading: boolean;
  error: null | string;
  
  // Actions
  setProfiles: (profiles: Profile[]) => void;
  nextProfile: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const useProfilesStore = create<ProfilesState>()(
  devtools((set) => ({
    // State
    profiles: [],
    currentProfileIndex: 0,
    isLoading: false,
    error: null,
    
    // Actions
    setProfiles: (profiles) => set({ profiles, currentProfileIndex: 0 }),
    nextProfile: () => set((state) => ({ 
      currentProfileIndex: state.currentProfileIndex + 1 >= state.profiles.length 
        ? state.currentProfileIndex 
        : state.currentProfileIndex + 1 
    })),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
  }))
);

export default useProfilesStore;
