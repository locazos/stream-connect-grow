
import useAuthStore from './useAuthStore';
import useProfilesStore from './useProfilesStore';
import useMatchesStore from './useMatchesStore';

// Combine all stores into a single hook for backward compatibility
const useStore = () => {
  const auth = useAuthStore();
  const profiles = useProfilesStore();
  const matches = useMatchesStore();

  return {
    // Auth state and actions
    session: auth.session,
    user: auth.user,
    profile: auth.profile,
    setSession: auth.setSession,
    setUser: auth.setUser,
    setProfile: auth.setProfile,

    // Profiles state and actions
    profiles: profiles.profiles,
    currentProfileIndex: profiles.currentProfileIndex,
    setProfiles: profiles.setProfiles,
    nextProfile: profiles.nextProfile,

    // Matches state and actions
    matches: matches.matches,
    showMatchModal: matches.showMatchModal,
    matchedProfile: matches.matchedProfile,
    swipe: matches.swipe,
    loadMatches: matches.loadMatches,
    setShowMatchModal: matches.setShowMatchModal,
    setMatchedProfile: matches.setMatchedProfile,

    // Shared state
    isLoading: matches.isLoading || profiles.isLoading,
    error: matches.error || profiles.error,
    setIsLoading: matches.setIsLoading,
    setError: matches.setError,
  };
};

export default useStore;
