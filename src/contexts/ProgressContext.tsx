
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ProgressContextType } from '../types';
import { videosApi } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

// Create the context
const ProgressContext = createContext<ProgressContextType>({
  watchedVideos: new Set<number>(),
  toggleWatched: () => { },
  resetProgress: () => { },
  exportProgress: () => '',
  importProgress: () => { },
});

export const useProgress = () => useContext(ProgressContext);

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [watchedVideos, setWatchedVideos] = useState<Set<number>>(new Set());

  // Load watched videos initially from API
  const fetchWatchedStatus = async () => {
    try {
      const allVideos = await videosApi.getAll();
      const watched = new Set<number>();

      allVideos.forEach(video => {
        if (video.id && video.watched) {
          watched.add(Number(video.id));
        }
      });

      setWatchedVideos(watched);
    } catch (error) {
      console.error('Error fetching watched videos:', error);
    }
  };

  // Load watched videos initially
  useEffect(() => {
    fetchWatchedStatus();
  }, []);

  // Toggle watched state (communicating with API)
  const toggleWatched = async (videoId: number) => {
    try {
      const isCurrentlyWatched = watchedVideos.has(videoId);
      
      // Optimistic UI update
      setWatchedVideos(prevWatched => {
        const newWatched = new Set(prevWatched);
        if (newWatched.has(videoId)) {
          newWatched.delete(videoId);
        } else {
          newWatched.add(videoId);
        }
        return newWatched;
      });
      
      // API call
      if (isCurrentlyWatched) {
        await videosApi.markAsUnwatched(videoId);
      } else {
        await videosApi.markAsWatched(videoId);
      }
    } catch (error) {
      console.error('Error toggling watched status:', error);
      // Revert optimistic update on error
      fetchWatchedStatus();
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update watched status"
      });
    }
  };

  // Reset all watched progress
  const resetProgress = async () => {
    try {
      const result = await videosApi.resetProgress();
      
      // Update state after API success
      setWatchedVideos(new Set());
      
      toast({
        title: "Progress Reset",
        description: `${result.reset_count} videos have been marked as unwatched.`
      });
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset progress on the server."
      });
    }
  };

  // These are now dummy functions since we're not using localStorage anymore
  const exportProgress = () => JSON.stringify([...watchedVideos]);
  const importProgress = (json: string) => {
    // This is kept to maintain API compatibility, but doesn't use localStorage
    try {
      const importedWatched = JSON.parse(json);
      if (Array.isArray(importedWatched)) {
        setWatchedVideos(new Set(importedWatched));
      } else {
        throw new Error('Invalid import format');
      }
    } catch (error) {
      console.error('Error importing progress:', error);
      throw error;
    }
  };

  return (
    <ProgressContext.Provider
      value={{
        watchedVideos,
        toggleWatched,
        resetProgress,
        exportProgress,
        importProgress
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};
