export const API_BASE_URL = 'http://localhost:3001/api';

//  Types
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

export interface User {
  id: number;
  email: string;
  name: string | null;
  whatsapp: string | null;
}

export interface ProcessedEmail {
  id: number;
  userId: number;
  emailAccountId: number;
  messageId: string;
  subject: string | null;
  sender: string | null;
  summary: string | null;
  priorityScore: number | null;
  notified: boolean;
  digestIncluded: boolean;
  receivedAt: string | null;
  processedAt: string;
  emailAccount: {
    provider: string;
    email: string;
  };
}

export interface EmailAccount {
  id: number;
  provider: string;
  email: string;
  isActive: boolean;
  lastSynced: string | null;
  createdAt: string;
}

export interface DigestSetting {
  id: number;
  userId: number;
  enabled: boolean;
  sendTime: string;
  timezone: string;
  minEmails: number;
}

// ── Fetchers ───────────────────────────────────────────

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
  const response = await fetch(`${API_BASE_URL}/filters/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete filter');
}

export async function fetchEmails(): Promise<ProcessedEmail[]> {
  const response = await fetch(`${API_BASE_URL}/emails?limit=50`);
  if (!response.ok) throw new Error('Failed to fetch emails');
  const result = await response.json();
  // API now returns { data, total, page, limit, totalPages }
  return result.data ?? result;
}

export async function fetchAccounts(): Promise<EmailAccount[]> {
  const response = await fetch(`${API_BASE_URL}/accounts`);
  if (!response.ok) throw new Error('Failed to fetch accounts');
  return response.json();
}

export async function fetchDigestSettings(): Promise<DigestSetting> {
  const response = await fetch(`${API_BASE_URL}/digest-settings`);
  if (!response.ok) throw new Error('Failed to fetch digest settings');
  return response.json();
}

export async function updateDigestSettings(settings: Partial<DigestSetting>): Promise<DigestSetting> {
  const response = await fetch(`${API_BASE_URL}/digest-settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return response.json();
}

export async function fetchProfile(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/profile`);
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
}

