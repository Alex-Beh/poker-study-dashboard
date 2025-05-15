
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

// ---- Videos API ----
export const videosApi = {
  getAll: async (): Promise<Video[]> => {
    const response = await api.get('/videos/');
    return normalizeResponse(response) || [];
  },

  getByCategory: async (
    category: string,
    page: number = 1,
    limit: number = 12
  ): Promise<CategoryVideosResponse> => {
    const response = await api.get(`/videos/category/${category}?page=${page}&limit=${limit}`);
    return normalizeResponse(response) || { videos: [], page: 1, limit, total: 0, total_pages: 1 };
  },

  getById: async (videoId: number | string): Promise<Video> => {
    const response = await api.get(`/videos/${videoId}`);
    return normalizeResponse(response);
  },

  search: async (query: string): Promise<Video[]> => {
    const response = await api.get(`/videos/search?q=${encodeURIComponent(query)}`);
    return normalizeResponse(response) || [];
  },

  getByCreator: async (
    youtuberId: number | string,
    page: number = 1,
    limit: number = 20
  ): Promise<CategoryVideosResponse> => {
    const response = await api.get(`/videos/by-creator/${youtuberId}?page=${page}&limit=${limit}`);
    return normalizeResponse(response) || { videos: [], page: 1, limit, total: 0, total_pages: 1 };
  },

  markAsWatched: async (videoId: number | string): Promise<{ watched: boolean }> => {
    const response = await api.patch(`/videos/${videoId}/watch`);
    return normalizeResponse(response) || { watched: true };
  }
};

// ---- Categories API ----
export const categoriesApi = {
  getAll: async (): Promise<CategoryItem[]> => {
    const response = await api.get('/categories');
    return normalizeResponse(response) || [];
  },

  delete: async (slug: string): Promise<void> => {
    const response = await api.delete(`/categories/${slug}`);
    return normalizeResponse(response);
  },

  create: async (data: { name: string, slug?: string }): Promise<CategoryItem> => {
    const response = await api.post('/categories', data);
    return normalizeResponse(response);
  }
};

// ---- Tags API ----
export const tagsApi = {
  getAll: async (): Promise<any[]> => {
    const response = await api.get('/tags');
    return normalizeResponse(response) || [];
  },

  delete: async (slug: string): Promise<void> => {
    const response = await api.delete(`/tags/${slug}`);
    return normalizeResponse(response);
  },

  create: async (data: { name: string, slug?: string }): Promise<any> => {
    const response = await api.post('/tags', data);
    return normalizeResponse(response);
  }
};

// ---- Youtubers API ----
export const youtubersApi = {
  getAll: async (): Promise<Creator[]> => {
    const response = await api.get('/youtubers');
    return normalizeResponse(response) || [];
  },

  create: async (name: string, slug: string, channelUrl?: string): Promise<Creator> => {
    const response = await api.post('/youtubers', { name, slug, channel_url: channelUrl });
    return normalizeResponse(response);
  },

  delete: async (slug: string): Promise<void> => {
    const response = await api.delete(`/youtubers/${slug}`);
    return normalizeResponse(response);
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
