
import React, { useMemo } from 'react';
import { useProgress } from '@/contexts/ProgressContext';
import { Video } from '@/types';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CategorySidebarProps {
  categoryMap: Record<string, number[]>;
  videos: Video[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categoryMap,
  videos,
  selectedCategory,
  onSelectCategory,
}) => {
  const { watchedVideos } = useProgress();
  
  const categories = useMemo(() => {
    const videosById = new Map(videos.map(video => [video.video_id, video]));
    
    return Object.entries(categoryMap).map(([name, videoIds]) => {
      const categoryVideos = videoIds
        .map(id => videosById.get(id))
        .filter((v): v is Video => !!v);
      
      const watchedCount = videoIds.filter(id => watchedVideos.has(id)).length;
      
      return {
        name,
        videos: categoryVideos,
        watchedCount,
        totalCount: videoIds.length,
        progress: videoIds.length > 0 ? (watchedCount / videoIds.length) * 100 : 0
      };
    });
  }, [categoryMap, videos, watchedVideos]);

  if (categories.length === 0) {
    return (
      <div className="w-full md:w-64 md:min-w-64 bg-card border-r flex items-center justify-center p-4">
        <p className="text-muted-foreground">No categories available</p>
      </div>
    );
  }

  return (
    <div className="w-full md:w-64 md:min-w-64 bg-card border-r md:h-[calc(100vh-5rem)] overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-4">
          <h2 className="font-bold mb-4">Categories</h2>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.name}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  selectedCategory === category.name
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => onSelectCategory(category.name)}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-xs">
                    {category.watchedCount}/{category.totalCount}
                  </span>
                </div>
                <Progress value={category.progress} className="h-1" />
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default CategorySidebar;
