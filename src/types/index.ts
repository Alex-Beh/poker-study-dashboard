
export interface Video {
  video_id: number;
  title: string;
  duration: number;
  thumbnail_url: string; // Updated from thumbnail
  youtube_url: string; // Updated from url
  categories?: string[];
  sequence?: number;
  duration_min?: number;
  creator_id?: string;
  youtuber_id?: number;
  watched?: boolean;
  upload_date?: string;
}

export interface Creator {
  id: number;
  name: string;
  slug: string;
  channel_url?: string;
  created_at?: string;
}

export interface Category {
  name: string;
  slug: string;
  videos: Video[];
  watchedCount: number;
  count?: number;
  isUserDefined?: boolean;
}

export interface CategoryItem {
  name: string;
  slug: string;
  count: number;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: CategoryItem[];
}

export interface YoutubersResponse {
  success: boolean;
  message: string;
  data: Creator[];
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
