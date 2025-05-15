
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ProgressContextType } from '../types';
import { videosApi } from '@/services/api';
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

  // Initial load of watched videos from API
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

  // Toggle a video's watched status
  const toggleWatched = async (videoId: number) => {
    try {
      // Call API to update watched status
      if (!watchedVideos.has(videoId)) {
        // Only call API if we're marking as watched
        await videosApi.markAsWatched(videoId);
      }
      
      // Update local state for immediate UI feedback
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

  // Reset all progress (need to implement server-side reset)
  const resetProgress = async () => {
    try {
      // We should ideally have an API endpoint for this
      // For now, let's just clear the local state
      setWatchedVideos(new Set());
      toast({
        title: "Progress Reset",
        description: "All watched status has been reset."
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

  // Export progress as JSON (for backup purposes)
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
