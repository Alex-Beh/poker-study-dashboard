
import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import CategorySidebar from '@/components/CategorySidebar';
import VideoGrid from '@/components/VideoGrid';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { Video } from '@/types';
import videosData from '@/data/videos.json';

const CATEGORY_MAP: Record<string, number[]> = {
  "Foundations": [225, 224, 223, 211, 82, 95, 33, 128],
  "Pre-Flop Fundamentals": [18, 147, 4, 20],
  "Post-Flop Building Blocks": [30, 174, 9, 61, 17, 99],
  "Exploit vs. GTO": [7, 8, 11, 35],
  "Multi-Way & Deep-Stack": [40, 41, 6, 69],
  "Tournament Transition": [70, 52, 149, 154],
  "Exploiting Player Types": [84, 85, 105, 75, 103, 130, 101],
  "End-Game & ICM": [175, 106, 100, 99],
  "Mental Game & Review": [58, 108]
};

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>(Object.keys(CATEGORY_MAP)[0]);
  
  // Parse and enrich video data with categories
  const videos = useMemo(() => {
    const allVideos = videosData as Video[];
    
    // Add categories to each video
    return allVideos.map(video => {
      const categories = Object.entries(CATEGORY_MAP)
        .filter(([_, videoIds]) => videoIds.includes(video.video_id))
        .map(([category]) => category);
      
      return { ...video, categories };
    });
  }, []);
  
  // Filter videos for the selected category
  const categoryVideos = useMemo(() => {
    const categoryVideoIds = CATEGORY_MAP[selectedCategory] || [];
    return videos.filter(video => categoryVideoIds.includes(video.video_id));
  }, [selectedCategory, videos]);

  return (
    <ProgressProvider>
      <div className="min-h-screen flex flex-col">
        <Header videos={videos} />
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <CategorySidebar
            categoryMap={CATEGORY_MAP}
            videos={videos}
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
