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

  // Load watched videos initially
  useEffect(() => {
    const fetchWatchedStatus = async () => {
      try {
        const allVideos = await videosApi.getAll();
        const watched = new Set<number>();

        allVideos.forEach(video => {
          const videoId = typeof video.id === 'number' ? video.id : parseInt(video.id as string, 10);
          if (!isNaN(videoId) && video.watched) {
            watched.add(videoId);
          }
        });

        setWatchedVideos(watched);
      } catch (error) {
        console.error('Error fetching watched videos:', error);
      }
    };

    fetchWatchedStatus();
  }, []);

  // Toggle watched state
  const toggleWatched = async (videoId: number) => {
    try {
      const isWatched = watchedVideos.has(videoId);

      if (isWatched) {
        await videosApi.markAsUnwatched(videoId);
      } else {
        await videosApi.markAsWatched(videoId);
      }

      // Update local state
      setWatchedVideos(prevWatched => {
        const newWatched = new Set(prevWatched);
        if (newWatched.has(videoId)) {
          newWatched.delete(videoId);
        } else {
          newWatched.add(videoId);
        }
        return newWatched;
      });
    } catch (error) {
      console.error('Error updating watched status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update watched status on the server."
      });
    }
  };

  // Reset all watched progress
  const resetProgress = async () => {
    try {
      await videosApi.resetProgress();
      setWatchedVideos(new Set());
      toast({
        title: "Progress Reset",
        description: "All watched statuses have been reset."
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

  const exportProgress = () => JSON.stringify([...watchedVideos]);

  const importProgress = (json: string) => {
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
