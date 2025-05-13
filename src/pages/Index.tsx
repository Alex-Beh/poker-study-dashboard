
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import CategorySidebar from '@/components/CategorySidebar';
import VideoGrid from '@/components/VideoGrid';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { fetchAllVideos } from '@/services/api';
import { Video } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: fetchAllVideos
  });
  
  // Build category map from fetched videos
  const categoryMap = React.useMemo(() => {
    if (!videos) return {};
    
    const map: Record<string, number[]> = {};
    videos.forEach(video => {
      if (video.categories) {
        video.categories.forEach(category => {
          if (!map[category]) {
            map[category] = [];
          }
          map[category].push(video.video_id);
        });
      }
    });
    
    return map;
  }, [videos]);
  
  // Set initial category when data is loaded
  React.useEffect(() => {
    if (videos && videos.length > 0 && !selectedCategory) {
      // Get first category from the first video
      const firstVideo = videos[0];
      if (firstVideo.categories && firstVideo.categories.length > 0) {
        setSelectedCategory(firstVideo.categories[0]);
      }
    }
  }, [videos, selectedCategory]);
  
  // Filter videos for the selected category
  const categoryVideos = React.useMemo(() => {
    if (!videos || !selectedCategory) return [];
    return videos.filter(video => 
      video.categories && video.categories.includes(selectedCategory)
    ).sort((a, b) => (a.sequence || 0) - (b.sequence || 0)); // Sort by sequence
  }, [selectedCategory, videos]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col p-4">
        <div className="h-14 mb-4">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex-1 flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-64">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md max-w-md">
          <h2 className="text-lg font-bold">Error Loading Data</h2>
          <p>Failed to connect to the backend server. Make sure your Flask API is running on http://localhost:5000.</p>
        </div>
      </div>
    );
  }

  return (
    <ProgressProvider>
      <div className="min-h-screen flex flex-col">
        <Header videos={videos || []} />
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <CategorySidebar
            categoryMap={categoryMap}
            videos={videos || []}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          <VideoGrid 
            videos={categoryVideos}
            categoryName={selectedCategory}
          />
        </div>
      </div>
    </ProgressProvider>
  );
};

export default Index;
