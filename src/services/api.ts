
import { Video, Creator } from '@/types';

const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchAllVideos(): Promise<Video[]> {
  const response = await fetch(`${API_BASE_URL}/videos`);
  if (!response.ok) {
    throw new Error('Failed to fetch videos');
  }
  return response.json();
}

export interface CategoryVideosResponse {
  videos: Video[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export async function fetchCategoryVideos(
  category: string, 
  page: number = 1, 
  limit: number = 12
): Promise<CategoryVideosResponse> {
  // Convert category to slug format for the API
  const categorySlug = category.toLowerCase().replace(/\W+/g, '-');
  
  const response = await fetch(
    `${API_BASE_URL}/videos/${categorySlug}?page=${page}&limit=${limit}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch videos for category: ${category}`);
  }
  
  return response.json();
}

export async function fetchCategories(): Promise<{ name: string; count: number }[]> {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}

export async function fetchVideoById(videoId: number): Promise<Video> {
  const response = await fetch(`${API_BASE_URL}/video/${videoId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch video with ID: ${videoId}`);
  }
  return response.json();
}

export async function searchVideos(query: string): Promise<Video[]> {
  const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search videos');
  }
  return response.json();
}

// New API functions for creator support
export async function fetchCreators(): Promise<Creator[]> {
  const response = await fetch(`${API_BASE_URL}/creators`);
  if (!response.ok) {
    throw new Error('Failed to fetch creators');
  }
  return response.json();
}

export async function fetchCreatorVideos(
  creatorId: string,
  page: number = 1,
  limit: number = 12
): Promise<CategoryVideosResponse> {
  const response = await fetch(
    `${API_BASE_URL}/videos/by-creator/${creatorId}?page=${page}&limit=${limit}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch videos for creator: ${creatorId}`);
  }
  
  return response.json();
}
