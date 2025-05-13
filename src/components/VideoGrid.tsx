
import React, { useState } from 'react';
import { Video } from '@/types';
import VideoCard from './VideoCard';
import { Input } from '@/components/ui/input';

interface VideoGridProps {
  videos: Video[];
  categoryName: string;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, categoryName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredVideos = searchTerm
    ? videos.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : videos;

  return (
    <div className="flex-1 overflow-hidden">
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{categoryName}</h2>
          <div className="w-full max-w-xs">
            <Input
              type="search"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>
        
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-4">
            {filteredVideos.map((video) => (
              <VideoCard key={video.video_id} video={video} />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">
              {searchTerm ? 'No videos match your search' : 'No videos in this category'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGrid;
