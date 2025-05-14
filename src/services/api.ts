
import { Video, Creator, CategoryResponse, YoutubersResponse } from '@/types';

const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchAllVideos(): Promise<Video[]> {
  const response = await fetch(`${API_BASE_URL}/videos`);
  if (!response.ok) {
    throw new Error('Failed to fetch videos');
  }
  const data = await response.json();
  return data;
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

export async function fetchCategories(): Promise<CategoryResponse> {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  const data = await response.json();
  return data;
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

// New API functions for creator (youtuber) support
export async function fetchYoutubers(): Promise<YoutubersResponse> {
  const response = await fetch(`${API_BASE_URL}/youtubers`);
  if (!response.ok) {
    throw new Error('Failed to fetch youtubers');
  }
  const data = await response.json();
  return data;
}

export async function createYoutuber(name: string, slug: string, channelUrl?: string): Promise<Creator> {
  const response = await fetch(`${API_BASE_URL}/youtubers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, slug, channel_url: channelUrl })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create youtuber');
  }
  
  const data = await response.json();
  return data.data;
}

export async function deleteYoutuber(slug: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/youtubers/${slug}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete youtuber: ${slug}`);
  }
}

// New API function for marking videos as watched
export async function markVideoAsWatched(videoId: number): Promise<{ watched: boolean }> {
  const response = await fetch(`${API_BASE_URL}/video/${videoId}/watch`, {
    method: 'PATCH'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to mark video ${videoId} as watched`);
  }
  
  const data = await response.json();
  return data;
}

// New API functions for category and tag management
export async function deleteCategory(slug: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/categories/${slug}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete category: ${slug}`);
  }
}

export async function deleteTag(slug: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tags/${slug}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete tag: ${slug}`);
  }
}

// Add this to your api.ts file
export async function fetchCreatorVideos(youtuberSlug: string): Promise<Video[]> {
  const response = await fetch(`${API_BASE_URL}/videos?creator=${encodeURIComponent(youtuberSlug)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch videos for youtuber: ${youtuberSlug}`);
  }
  const data = await response.json();
  return data;
}
