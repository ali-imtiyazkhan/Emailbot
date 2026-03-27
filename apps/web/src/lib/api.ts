export const API_BASE_URL = 'http://localhost:3001/api';

export interface PostResponse {
  message: string;
}

export interface Stats {
  totalProcessed: number;
}

export interface FilterRule {
  id: number;
  userId: number;
  ruleType: string;
  value: string;
  isActive: boolean;
  createdAt: string;
}

export async function fetchStats(): Promise<Stats> {
  const response = await fetch(`${API_BASE_URL}/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export async function fetchFilters(): Promise<FilterRule[]> {
  const response = await fetch(`${API_BASE_URL}/filters`);
  if (!response.ok) throw new Error('Failed to fetch filters');
  return response.json();
}

export async function createFilter(type: string, value: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/filters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, value }),
  });
  if (!response.ok) throw new Error('Failed to create filter');
}

export async function deleteFilter(id: number): Promise<void> {
  // Assuming a delete endpoint exists or will be added
  const response = await fetch(`${API_BASE_URL}/filters/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete filter');
}
