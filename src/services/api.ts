
import { Video } from '@/types';

const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchAllVideos(): Promise<Video[]> {
  const response = await fetch(`${API_BASE_URL}/videos`);
  if (!response.ok) {
    throw new Error('Failed to fetch videos');
  }
  return response.json();
}

export async function fetchVideosByCategory(category: string): Promise<Video[]> {
  const response = await fetch(`${API_BASE_URL}/videos/${encodeURIComponent(category)}`);
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
