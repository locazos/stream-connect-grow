
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useExploreProfiles = (userId: string | undefined) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfiles = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get swiped profiles
      const { data: swipedData, error: swipedError } = await supabase
        .from('swipes')
        .select('target_id')
        .eq('swiper_id', userId);
      
      if (swipedError) {
        console.error('Error loading swiped profiles:', swipedError);
        setError("Error loading swiped profiles");
        return;
      }
      
      const swipedIds = swipedData.map(swipe => swipe.target_id);
      const excludeIds = [...swipedIds, userId];
      
      let query = supabase
        .from('profiles')
        .select('*');
      
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }
      
      const { data: profilesData, error: profilesError } = await query;
      
      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        setError("Error loading profiles");
        return;
      }
      
      const normalizedProfiles: Profile[] = profilesData.map(profile => ({
        ...profile,
        twitch_id: profile.twitch_id ?? null
      }));
      
      setProfiles(normalizedProfiles);
      
    } catch (error) {
      console.error('Error in loadProfiles:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profiles,
    isLoading,
    error,
    loadProfiles,
    setProfiles
  };
};
