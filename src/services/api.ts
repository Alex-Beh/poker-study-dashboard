
import { Video, Creator, CategoryResponse, YoutubersResponse, CategoryItem } from '@/types';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create an axios instance for our API calls
const api = axios.create({
  baseURL: API_BASE_URL
});

// ---- Videos API ----
export const videosApi = {
  getAll: async (): Promise<Video[]> => {
    const response = await api.get('/videos');
    return response.data;
  },

  getByCategory: async (
    category: string, 
    page: number = 1, 
    limit: number = 12
  ): Promise<CategoryVideosResponse> => {
    const categorySlug = category.toLowerCase().replace(/\W+/g, '-');
    const response = await api.get(`/videos/${categorySlug}?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (videoId: number): Promise<Video> => {
    const response = await api.get(`/video/${videoId}`);
    return response.data;
  },

  search: async (query: string): Promise<Video[]> => {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getByCreator: async (creatorSlug: string): Promise<Video[]> => {
    const response = await api.get(`/videos?creator=${encodeURIComponent(creatorSlug)}`);
    return response.data;
  },

  markAsWatched: async (videoId: number): Promise<{ watched: boolean }> => {
    const response = await api.patch(`/video/${videoId}/watch`);
    return response.data;
  }
};

// ---- Categories API ----
export const categoriesApi = {
  getAll: async (): Promise<CategoryResponse> => {
    const response = await api.get('/categories');
    return response.data;
  },

  delete: async (slug: string): Promise<void> => {
    await api.delete(`/categories/${slug}`);
  },
  
  create: async (data: { name: string, slug: string }): Promise<CategoryItem> => {
    const response = await api.post('/categories', data);
    return response.data.data;
  }
};

// ---- Tags API ----
export const tagsApi = {
  getAll: async (): Promise<any> => {
    const response = await api.get('/tags');
    return response.data;
  },

  delete: async (slug: string): Promise<void> => {
    await api.delete(`/tags/${slug}`);
  },
  
  create: async (data: { name: string, slug: string }): Promise<any> => {
    const response = await api.post('/tags', data);
    return response.data.data;
  }
};

// ---- Youtubers API ----
export const youtubersApi = {
  getAll: async (): Promise<YoutubersResponse> => {
    const response = await api.get('/youtubers');
    return response.data;
  },

  create: async (name: string, slug: string, channelUrl?: string): Promise<Creator> => {
    const response = await api.post('/youtubers', { name, slug, channel_url: channelUrl });
    return response.data.data;
  },

  delete: async (slug: string): Promise<void> => {
    await api.delete(`/youtubers/${slug}`);
  }
};

// Legacy functions for backward compatibility
export interface CategoryVideosResponse {
  videos: Video[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

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
