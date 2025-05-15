
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
          const videoId = video.id ? Number(video.id) : null;
          if (videoId && video.watched) {
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
  const toggleWatched = (videoId: number) => {
    setWatchedVideos(prevWatched => {
      const newWatched = new Set(prevWatched);
      if (newWatched.has(videoId)) {
        newWatched.delete(videoId);
      } else {
        newWatched.add(videoId);
      }
      return newWatched;
    });
  };

  // Reset all watched progress
  const resetProgress = async () => {
    try {
      const result = await videosApi.resetProgress();
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
