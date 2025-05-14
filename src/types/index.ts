
export interface Video {
  video_id: number;
  title: string;
  duration: number;
  thumbnail: string;
  url: string;
  categories?: string[];
  sequence?: number;
  duration_min?: number;
  creator_id?: string;
}

export interface Creator {
  id: string;
  name: string;
}

export interface Category {
  name: string;
  slug?: string;
  videos: Video[];
  watchedCount: number;
  count?: number;
  isUserDefined?: boolean;
}

export interface UserCategory {
  id: string;
  name: string;
  creatorId: string;
  videoIds: number[];
}

export interface ProgressContextType {
  watchedVideos: Set<number>;
  toggleWatched: (videoId: number) => void;
  resetProgress: () => void;
  exportProgress: () => string;
  importProgress: (json: string) => void;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}
