
import { Video, Creator, CategoryResponse, YoutubersResponse, CategoryItem } from '@/types';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create an axios instance for our API calls
const api = axios.create({
  baseURL: API_BASE_URL
});

// Helper function to normalize API responses
const normalizeResponse = (response: any) => {
  // Check if the response follows our standard format
  if (response.data && typeof response.data === 'object') {
    if ('data' in response.data) {
      return response.data.data;
    }
  }
  // Fallback to the direct response data
  return response.data;
};

// Handle API errors consistently
const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  const errorMsg =
    error?.response?.data?.message ||
    error?.response?.data?.errors?.general ||
    error?.message ||
    'Unknown API error';
  throw new Error(errorMsg);
};

// ---- Videos API ----
export const videosApi = {
  getAll: async (): Promise<Video[]> => {
    try {
      const response = await api.get('/videos/');
      return normalizeResponse(response) || [];
    } catch (error) {
      return handleApiError(error);
    }
  },

  getByCategory: async (
    category: string,
    page: number = 1,
    limit: number = 12
  ): Promise<CategoryVideosResponse> => {
    try {
      const response = await api.get(`/videos/category/${category}?page=${page}&limit=${limit}`);
      return normalizeResponse(response) || { videos: [], page: 1, limit, total: 0, total_pages: 1 };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (videoId: number | string): Promise<Video> => {
    try {
      const id = typeof videoId === 'string' ? parseInt(videoId, 10) : videoId;
      const response = await api.get(`/videos/${id}`);
      return normalizeResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  search: async (query: string): Promise<Video[]> => {
    try {
      const response = await api.get(`/videos/search?q=${encodeURIComponent(query)}`);
      return normalizeResponse(response) || [];
    } catch (error) {
      return handleApiError(error);
    }
  },

  getByCreator: async (
    youtuberId: number | string,
    page: number = 1,
    limit: number = 100 // Increased limit to get more videos at once
  ): Promise<CategoryVideosResponse> => {
    try {
      const id = typeof youtuberId === 'string' ? parseInt(youtuberId, 10) : youtuberId;
      const response = await api.get(`/videos/by-creator/${id}?page=${page}&limit=${limit}`);
      return normalizeResponse(response) || { videos: [], page: 1, limit, total: 0, total_pages: 1 };
    } catch (error) {
      return handleApiError(error);
    }
  },

  markAsWatched: async (videoId: number | string): Promise<{ watched: boolean }> => {
    try {
      // Ensure videoId is properly parsed as a number
      const id = typeof videoId === 'string' ? parseInt(videoId, 10) : videoId;

      if (isNaN(id as number)) {
        throw new Error('Invalid video ID');
      }

      console.log("Marking video as watched:", id);

      const response = await api.patch(`/videos/${id}/watch`);
      return normalizeResponse(response) || { watched: true };
    } catch (error) {
      return handleApiError(error);
    }
  },
  markAsUnwatched: async (videoId: number | string): Promise<{ watched: boolean }> => {
    try {
      const id = typeof videoId === 'string' ? parseInt(videoId, 10) : videoId;
      if (isNaN(id)) throw new Error('Invalid video ID');

      console.log("Marking video as unwatched:", id);
      const response = await api.patch(`/videos/${id}/unwatch`);
      return normalizeResponse(response) || { watched: false };
    } catch (error) {
      return handleApiError(error);
    }
  },

  resetProgress: async (): Promise<{ reset_count: number }> => {
    try {
      const response = await api.patch('/videos/reset-progress');
      return normalizeResponse(response) || { reset_count: 0 };
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// ---- Categories API ----
export const categoriesApi = {
  getAll: async (): Promise<CategoryItem[]> => {
    try {
      const response = await api.get('/categories');
      return normalizeResponse(response) || [];
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (slug: string): Promise<void> => {
    try {
      const response = await api.delete(`/categories/${slug}`);
      return normalizeResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (data: { name: string, slug?: string }): Promise<CategoryItem> => {
    try {
      const response = await api.post('/categories', data);
      return normalizeResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// ---- Tags API ----
export const tagsApi = {
  getAll: async (): Promise<any[]> => {
    try {
      const response = await api.get('/tags');
      return normalizeResponse(response) || [];
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (slug: string): Promise<void> => {
    try {
      const response = await api.delete(`/tags/${slug}`);
      return normalizeResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (data: { name: string, slug?: string }): Promise<any> => {
    try {
      const response = await api.post('/tags', data);
      return normalizeResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// ---- Youtubers API ----
export const youtubersApi = {
  getAll: async (): Promise<Creator[]> => {
    try {
      const response = await api.get('/youtubers');
      return normalizeResponse(response) || [];
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (name: string, slug: string, channelUrl?: string): Promise<Creator> => {
    try {
      const response = await api.post('/youtubers', { name, slug, channel_url: channelUrl });
      return normalizeResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (slug: string): Promise<void> => {
    try {
      const response = await api.delete(`/youtubers/${slug}`);
      return normalizeResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Response types
export interface CategoryVideosResponse {
  videos: Video[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Legacy functions for backward compatibility
export const fetchAllVideos = videosApi.getAll;
export const fetchCategoryVideos = videosApi.getByCategory;
export const fetchCategories = categoriesApi.getAll;
export const fetchVideoById = videosApi.getById;
export const searchVideos = videosApi.search;
export const fetchYoutubers = youtubersApi.getAll;
export const createYoutuber = youtubersApi.create;
export const deleteYoutuber = youtubersApi.delete;
export const deleteCategory = categoriesApi.delete;
export const deleteTag = tagsApi.delete;
export const markVideoAsWatched = videosApi.markAsWatched;
export const fetchCreatorVideos = videosApi.getByCreator;
