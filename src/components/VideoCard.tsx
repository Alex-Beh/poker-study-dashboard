
import React, { useState } from 'react';
import { Video } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useProgress } from '@/contexts/ProgressContext';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { watchedVideos, toggleWatched } = useProgress();
  const isWatched = watchedVideos.has(video.video_id);
  const [videoOpen, setVideoOpen] = useState(false);
  const [fullScreenMode, setFullScreenMode] = useState(false);

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
    setVideoOpen(true);
  };

  const handleThumbnailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFullScreenMode(true);

    // Add ESC key listener to exit fullscreen
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullScreenMode(false);
        document.removeEventListener('keydown', keyHandler);
      }
    };
    document.addEventListener('keydown', keyHandler);
  };

  const getEmbedUrl = (url: string) => {
    // Handle YouTube URLs
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (youtubeMatch && youtubeMatch[1]) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    return url; // Return original URL if not YouTube
  };

  return (
    <>
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
            className="w-full h-full object-cover cursor-pointer"
            onError={(e) => {
              // Use a placeholder if the image fails to load
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
            onClick={handleThumbnailClick}
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

      {/* Fullscreen thumbnail mode */}
      {fullScreenMode && (
        <div 
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setFullScreenMode(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white bg-black bg-opacity-40 p-2 rounded-full"
            onClick={() => setFullScreenMode(false)}
          >
            <X className="h-6 w-6" />
          </button>
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="max-h-screen max-w-full object-contain"
            onError={(e) => {
              // Use a placeholder if the image fails to load
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </div>
      )}

      {/* Video dialog */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-lg mb-4">{video.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full overflow-hidden rounded">
            <iframe
              src={getEmbedUrl(video.url)}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoCard;
