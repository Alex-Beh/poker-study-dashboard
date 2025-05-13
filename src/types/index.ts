
export interface Video {
  video_id: number;
  title: string;
  duration: number;
  thumbnail: string;
  url: string;
  categories?: string[];
}

export interface Category {
  name: string;
  videos: Video[];
  watchedCount: number;
}

export interface ProgressContextType {
  watchedVideos: Set<number>;
  toggleWatched: (videoId: number) => void;
  resetProgress: () => void;
  exportProgress: () => string;
  importProgress: (json: string) => void;
}
