import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { testForMatch, createMatch } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Match = Database['public']['Tables']['matches']['Row'] & { profile: Profile };

interface AppState {
  // Authentication
  session: null | any;
  user: null | any;
  profile: null | Profile;
  
  // App data
  profiles: Profile[];
  currentProfileIndex: number;
  matches: Match[];
  showMatchModal: boolean;
  matchedProfile: null | Profile;
  isLoading: boolean;
  error: null | string;
  
  // Actions
  setSession: (session: any) => void;
  setUser: (user: any) => void;
  setProfile: (profile: Profile | null) => void;
  setProfiles: (profiles: Profile[]) => void;
  nextProfile: () => void;
  swipe: (direction: 'left' | 'right') => Promise<void>;
  loadMatches: () => Promise<void>;
  setShowMatchModal: (show: boolean) => void;
  setMatchedProfile: (profile: Profile | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const useStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Authentication
        session: null,
        user: null,
        profile: null,
        
        // App data
        profiles: [],
        currentProfileIndex: 0,
        matches: [],
        showMatchModal: false,
        matchedProfile: null,
        isLoading: false,
        error: null,
        
        // Actions
        setSession: (session) => set({ session }),
        setUser: (user) => set({ user }),
        setProfile: (profile) => set({ profile }),
        setProfiles: (profiles) => set({ profiles, currentProfileIndex: 0 }),
        nextProfile: () => set((state) => ({ 
          currentProfileIndex: state.currentProfileIndex + 1 >= state.profiles.length 
            ? state.currentProfileIndex 
            : state.currentProfileIndex + 1 
        })),
        swipe: async (direction) => {
          const { user, profiles, currentProfileIndex } = get();
          
          if (!user || profiles.length === 0 || currentProfileIndex >= profiles.length) {
            return;
          }
          
          const targetProfile = profiles[currentProfileIndex];
          console.log(`Swiping ${direction} on ${targetProfile.username}`);
          
          try {
            // Add the swipe to the database
            const { error } = await supabase
              .from('swipes')
              .insert({
                swiper_id: user.id,
                target_id: targetProfile.id,
                direction
              });
              
            if (error) {
              console.error('Error creating swipe:', error);
              set({ error: error.message });
              return;
            }
            
            // If it was a right swipe, check for a match
            if (direction === 'right') {
              console.log('Checking for match...');
              const isMatch = await testForMatch(user.id, targetProfile.id);
              
              if (isMatch) {
                console.log('Match found! Creating match...');
                const matchCreated = await createMatch(user.id, targetProfile.id);
                
                if (matchCreated) {
                  console.log('Match created successfully!');
                  set({ 
                    showMatchModal: true,
                    matchedProfile: targetProfile
                  });
                  
                  // Refresh matches
                  get().loadMatches();
                }
              }
            }
            
            // Move to the next profile
            get().nextProfile();
            
          } catch (error) {
            console.error('Error in swipe function:', error);
            set({ error: 'An unexpected error occurred' });
          }
        },
        loadMatches: async () => {
          const { user } = get();
          if (!user) return;
          
          set({ isLoading: true });
          
          try {
            // Get all matches where the current user is either user_a or user_b
            const { data: matchesData, error: matchesError } = await supabase
              .from('matches')
              .select('*')
              .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);
              
            if (matchesError) {
              console.error('Error loading matches:', matchesError);
              set({ error: matchesError.message, isLoading: false });
              return;
            }
            
            // For each match, get the other user's profile
            const matchesWithProfiles = await Promise.all(
              matchesData.map(async (match) => {
                const otherUserId = match.user_a === user.id ? match.user_b : match.user_a;
                
                const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', otherUserId)
                  .single();
                  
                if (profileError) {
                  console.error(`Error loading profile for match ${match.id}:`, profileError);
                  return { ...match, profile: null };
                }
                
                return { ...match, profile: profileData };
              })
            );
            
            // Filter out matches with null profiles
            const validMatches = matchesWithProfiles.filter(match => match.profile !== null) as Match[];
            
            set({ matches: validMatches, isLoading: false });
            
          } catch (error) {
            console.error('Error in loadMatches function:', error);
            set({ error: 'An unexpected error occurred', isLoading: false });
          }
        },
        setShowMatchModal: (show) => set({ showMatchModal: show }),
        setMatchedProfile: (profile) => set({ matchedProfile: profile }),
        setIsLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
      }),
      { name: 'stream-match-storage' }
    )
  )
);

export default useStore;
