
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ProgressContextType } from '../types';
import { markVideoAsWatched } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

// Create the context with default values
const ProgressContext = createContext<ProgressContextType>({
  watchedVideos: new Set<number>(),
  toggleWatched: () => {},
  resetProgress: () => {},
  exportProgress: () => '',
  importProgress: () => {},
});

export const useProgress = () => useContext(ProgressContext);

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [watchedVideos, setWatchedVideos] = useState<Set<number>>(new Set());

  // Load watched videos from localStorage on initial render
  useEffect(() => {
    const savedWatched = localStorage.getItem('watchedVideos');
    if (savedWatched) {
      try {
        const parsedWatched = JSON.parse(savedWatched);
        setWatchedVideos(new Set(parsedWatched));
      } catch (error) {
        console.error('Error parsing watched videos from localStorage:', error);
      }
    }
  }, []);

  // Save watched videos to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('watchedVideos', JSON.stringify([...watchedVideos]));
  }, [watchedVideos]);

  // Toggle a video's watched status
  const toggleWatched = (videoId: number) => {
    setWatchedVideos(prevWatched => {
      const newWatched = new Set(prevWatched);
      if (newWatched.has(videoId)) {
        newWatched.delete(videoId);
      } else {
        // When marking as watched, also call the API
        try {
          markVideoAsWatched(videoId)
            .catch(error => {
              console.error('Error marking video as watched:', error);
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update watched status on the server."
              });
            });
          newWatched.add(videoId);
        } catch (error) {
          console.error('Error marking video as watched:', error);
        }
      }
      return newWatched;
    });
  };

  // Reset all progress
  const resetProgress = () => {
    setWatchedVideos(new Set());
  };

  // Export progress as JSON
  const exportProgress = () => {
    return JSON.stringify([...watchedVideos]);
  };

  // Import progress from JSON
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
