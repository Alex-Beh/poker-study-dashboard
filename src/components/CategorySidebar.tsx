
import React, { useMemo } from 'react';
import { useProgress } from '@/contexts/ProgressContext';
import { useUserCategories } from '@/contexts/UserCategoriesContext';
import { useCreator } from '@/contexts/CreatorContext';
import { Video } from '@/types';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import UserCategoryManager from './UserCategoryManager';
import { Badge } from '@/components/ui/badge';

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
  const { userCategories } = useUserCategories();
  const { selectedCreator } = useCreator();
  
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
        progress: videoIds.length > 0 ? (watchedCount / videoIds.length) * 100 : 0,
        isUserDefined: false
      };
    });
  }, [categoryMap, videos, watchedVideos]);

  // Add user categories to the list
  const allCategories = useMemo(() => {
    if (!selectedCreator) return categories;
    
    const userCats = userCategories
      .filter(cat => cat.creatorId === selectedCreator.id)
      .map(cat => {
        const videoIds = cat.videoIds;
        const watchedCount = videoIds.filter(id => watchedVideos.has(id)).length;
        return {
          name: cat.name,
          id: cat.id,
          videos: videoIds.map(id => videos.find(v => v.video_id === id)).filter(Boolean) as Video[],
          watchedCount,
          totalCount: videoIds.length,
          progress: videoIds.length > 0 ? (watchedCount / videoIds.length) * 100 : 0,
          isUserDefined: true
        };
      });
      
    return [...categories, ...userCats];
  }, [categories, userCategories, selectedCreator, videos, watchedVideos]);

  if (allCategories.length === 0) {
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
            {/* System Categories */}
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
            
            {/* User Categories Section - only show if there are user categories */}
            {allCategories.some(c => c.isUserDefined) && (
              <>
                <Separator className="my-4" />
                
                {allCategories
                  .filter(c => c.isUserDefined)
                  .map((category) => (
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{category.name}</span>
                          <Badge variant="outline" className="text-xs">Custom</Badge>
                        </div>
                        <span className="text-xs">
                          {category.watchedCount}/{category.totalCount}
                        </span>
                      </div>
                      <Progress value={category.progress} className="h-1" />
                    </button>
                  ))
                }
              </>
            )}
          </div>
          
          {/* User Category Manager */}
          <Separator className="my-4" />
          <UserCategoryManager />
        </div>
      </ScrollArea>
    </div>
  );
};

export default CategorySidebar;
