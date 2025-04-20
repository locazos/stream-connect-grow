
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { testForMatch, createMatch } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import useAuthStore from './useAuthStore';
import useProfilesStore from './useProfilesStore';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Match = Database['public']['Tables']['matches']['Row'] & { profile: Profile };

interface MatchesState {
  matches: Match[];
  showMatchModal: boolean;
  matchedProfile: null | Profile;
  isLoading: boolean;
  error: null | string;
  
  // Actions
  swipe: (direction: 'left' | 'right') => Promise<void>;
  loadMatches: () => Promise<void>;
  setShowMatchModal: (show: boolean) => void;
  setMatchedProfile: (profile: Profile | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const useMatchesStore = create<MatchesState>()(
  devtools((set, get) => ({
    // State
    matches: [],
    showMatchModal: false,
    matchedProfile: null,
    isLoading: false,
    error: null,
    
    // Actions
    swipe: async (direction) => {
      const user = useAuthStore.getState().user;
      const { profiles, currentProfileIndex } = useProfilesStore.getState();
      
      if (!user || profiles.length === 0 || currentProfileIndex >= profiles.length) {
        console.error('Cannot swipe: invalid user or profile state');
        return;
      }
      
      const targetProfile = profiles[currentProfileIndex];
      console.log(`Swiping ${direction} on ${targetProfile.username} (ID: ${targetProfile.id})`);
      
      try {
        // Add the swipe to the database
        const { error: swipeError } = await supabase
          .from('swipes')
          .insert({
            swiper_id: user.id,
            target_id: targetProfile.id,
            direction
          });
          
        if (swipeError) {
          console.error('Error creating swipe:', swipeError);
          toast({
            title: "Error",
            description: "No se pudo registrar tu swipe. Intenta de nuevo.",
            variant: "destructive"
          });
          return;
        }
        
        console.log('Swipe successfully recorded');
        
        // If it was a right swipe, check for a match
        if (direction === 'right') {
          console.log('Right swipe detected, checking for match...');
          const isMatch = await testForMatch(user.id, targetProfile.id);
          
          if (isMatch) {
            console.log('Match found! Creating match record between', user.id, 'and', targetProfile.id);
            const matchCreated = await createMatch(user.id, targetProfile.id);
            
            console.log('Match creation result:', matchCreated);
            
            if (matchCreated) {
              console.log('Match created successfully!');
              // Immediately try to load the new match to verify it exists
              await get().loadMatches();
              
              toast({
                title: "¡Match!",
                description: `Hiciste match con ${targetProfile.username}`,
              });
              
              set({ 
                showMatchModal: true,
                matchedProfile: targetProfile
              });
            } else {
              console.error('Failed to create match');
              toast({
                title: "Error",
                description: "Hubo un problema al crear el match. Intenta de nuevo.",
                variant: "destructive"
              });
            }
          } else {
            console.log('No match found yet');
          }
        }
        
        // Move to the next profile
        useProfilesStore.getState().nextProfile();
        
      } catch (error) {
        console.error('Error in swipe function:', error);
        toast({
          title: "Error",
          description: "Ocurrió un error inesperado. Intenta de nuevo.",
          variant: "destructive"
        });
      }
    },
    loadMatches: async () => {
      const { user } = useAuthStore.getState();
      if (!user) {
        console.error('Cannot load matches: no user logged in');
        return;
      }
      
      set({ isLoading: true, error: null });
      
      try {
        console.log('Loading matches for user:', user.id);
        
        // Direct query with proper formatting for the OR condition
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);
          
        if (matchesError) {
          console.error('Error loading matches:', matchesError);
          set({ error: matchesError.message, isLoading: false });
          return;
        }
        
        console.log('Matches found:', matchesData);
        
        if (!matchesData || matchesData.length === 0) {
          console.log('No matches found for user:', user.id);
          set({ matches: [], isLoading: false });
          return;
        }
        
        // For each match, get the other user's profile
        const matchesWithProfiles = await Promise.all(
          matchesData.map(async (match) => {
            const otherUserId = match.user_a === user.id ? match.user_b : match.user_a;
            console.log(`Loading profile for match with user ID: ${otherUserId}`);
            
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', otherUserId)
              .single();
              
            if (profileError) {
              console.error(`Error loading profile for match ${match.id}:`, profileError);
              return { ...match, profile: null };
            }
            
            console.log(`Profile found for match:`, profileData);
            return { ...match, profile: profileData };
          })
        );
        
        // Filter out matches with null profiles
        const validMatches = matchesWithProfiles.filter(match => match.profile !== null) as Match[];
        
        console.log('Valid matches with profiles:', validMatches);
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
  }))
);

export default useMatchesStore;
