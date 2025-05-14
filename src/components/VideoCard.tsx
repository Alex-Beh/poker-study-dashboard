
import React, { useState } from 'react';
import { Video } from '@/types';
import { useProgress } from '@/contexts/ProgressContext';
import { useUserCategories } from '@/contexts/UserCategoriesContext';
import { useCreator } from '@/contexts/CreatorContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markVideoAsWatched } from '@/services/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Check, Maximize, Minimize } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { watchedVideos, toggleWatched } = useProgress();
  const { userCategories, assignVideoToCategory, unassignVideoFromCategory, isVideoInCategory } = useUserCategories();
  const { selectedCreator } = useCreator();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const queryClient = useQueryClient();
  
  const isWatched = video.watched || watchedVideos.has(video.video_id);
  const formattedDuration = video.duration_min 
    ? `${Math.floor(video.duration_min)}:${Math.round((video.duration_min % 1) * 60).toString().padStart(2, '0')}`
    : formatDuration(video.duration);
  
  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  const userCategoriesForCreator = selectedCreator
    ? userCategories.filter(cat => cat.creatorId === selectedCreator.id)
    : [];
  
  const handleCategoryToggle = (categoryId: string, videoId: number, isChecked: boolean) => {
    if (isChecked) {
      assignVideoToCategory(categoryId, videoId);
    } else {
      unassignVideoFromCategory(categoryId, videoId);
    }
  };

  const watchMutation = useMutation({
    mutationFn: (videoId: number) => markVideoAsWatched(videoId),
    onSuccess: () => {
      // Update local state first for immediate UI feedback
      toggleWatched(video.video_id);
      
      // Then refresh data from server
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      
      toast({
        title: "Video Marked as Watched",
        description: "Your progress has been updated."
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to Mark Video",
        description: (error as Error).message
      });
    }
  });
  
  const handleWatchedToggle = () => {
    if (!isWatched) {
      watchMutation.mutate(video.video_id);
    } else {
      // Just use the local toggle for now
      toggleWatched(video.video_id);
    }
  };

  const handleOpenVideo = () => {
    setIsDialogOpen(true);
  };

  const toggleFullScreen = () => {
    const iframe = document.getElementById(`video-iframe-${video.video_id}`) as HTMLIFrameElement;
    setIsFullScreen(!isFullScreen);
    
    if (!isFullScreen && iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      }
    }
  };
  
  return (
    <Card className={`overflow-hidden transition-all duration-200 ${isWatched ? 'opacity-60' : ''}`}>
      <div className="relative">
        <div 
          className="aspect-video bg-cover bg-center cursor-pointer" 
          style={{ backgroundImage: `url(${video.thumbnail_url || video.thumbnail})` }}
          onClick={handleOpenVideo}
        >
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
            {formattedDuration}
          </div>
        </div>
        
        <div className="absolute top-2 right-2">
          <Checkbox 
            checked={isWatched} 
            onCheckedChange={handleWatchedToggle}
            className="h-5 w-5 bg-white/90"
          />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-medium line-clamp-2 mb-2">{video.title}</h3>
        
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={handleOpenVideo}
          >
            Watch
          </Button>
          
          {selectedCreator && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="sr-only">Categories</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-folder"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {userCategoriesForCreator.length > 0 ? (
                  userCategoriesForCreator.map(category => (
                    <DropdownMenuItem 
                      key={category.id}
                      onClick={(e) => {
                        e.preventDefault();
                        const isInCategory = isVideoInCategory(category.id, video.video_id);
                        handleCategoryToggle(category.id, video.video_id, !isInCategory);
                      }}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span>{category.name}</span>
                      {isVideoInCategory(category.id, video.video_id) && (
                        <Check className="h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No custom categories</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="text-lg">{video.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            <iframe 
              id={`video-iframe-${video.video_id}`}
              src={`${video.youtube_url || video.url}?autoplay=1`}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={toggleFullScreen}>
              {isFullScreen ? (
                <>
                  <Minimize className="mr-2 h-4 w-4" />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize className="mr-2 h-4 w-4" />
                  Fullscreen
                </>
              )}
            </Button>
            <Button 
              onClick={() => {
                if (!isWatched) {
                  watchMutation.mutate(video.video_id);
                }
                setIsDialogOpen(false);
              }}
            >
              {isWatched ? "Close" : "Mark Watched & Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default VideoCard;
