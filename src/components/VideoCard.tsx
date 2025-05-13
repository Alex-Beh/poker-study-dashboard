
import React from 'react';
import { Video } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useProgress } from '@/contexts/ProgressContext';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { watchedVideos, toggleWatched } = useProgress();
  const isWatched = watchedVideos.has(video.video_id);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't open video if clicking on the checkbox or its container
    if ((e.target as HTMLElement).closest('.checkbox-container')) {
      e.preventDefault();
      return;
    }
    window.open(video.url, '_blank');
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:shadow-md cursor-pointer",
        isWatched && "bg-muted"
      )}
      onClick={handleClick}
    >
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Use a placeholder if the image fails to load
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        {isWatched && (
          <div className="absolute bottom-2 right-2 bg-success text-white text-xs px-2 py-1 rounded">
            Watched
          </div>
        )}
      </div>
      
      <CardContent className="pt-4">
        <h3 className="font-medium line-clamp-2 min-h-[3rem]" title={video.title}>
          {video.title}
        </h3>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-0">
        <span className="text-sm text-muted-foreground">
          {formatDuration(video.duration)}
        </span>
        
        <div 
          className="checkbox-container" 
          onClick={(e) => {
            e.stopPropagation();
            toggleWatched(video.video_id);
          }}
        >
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={`watched-${video.video_id}`} 
              checked={isWatched}
            />
            <label 
              htmlFor={`watched-${video.video_id}`}
              className="text-sm cursor-pointer select-none"
            >
              Watched
            </label>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default VideoCard;
