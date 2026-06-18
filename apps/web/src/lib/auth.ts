const TOKEN_KEY = 'emailbot_token';
const SECRET_KEY = 'emailbot_auth_secret';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SECRET_KEY);
}

export function getAuthSecret(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SECRET_KEY);
}

export function setAuthSecret(secret: string): void {
  localStorage.setItem(SECRET_KEY, secret);
}

export async function fetchToken(secret?: string): Promise<string | null> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    let activeSecret = secret || getAuthSecret();

    // Auto-extract from URL query parameter if running in the browser
    if (!activeSecret && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlSecret = params.get('secret');
      if (urlSecret) {
        activeSecret = urlSecret;
      }
    }

    let url = `${API_URL}/auth/token`;
    if (activeSecret) {
      url += `?secret=${encodeURIComponent(activeSecret)}`;
    }

    console.log('[auth] Fetching token from:', url);
    const res = await fetch(url);
    console.log('[auth] Token response status:', res.status);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.log('[auth] Token response body:', body);
      return null;
    }
    const data = await res.json();
    console.log('[auth] Token received:', data.token ? data.token.substring(0, 20) + '...' : 'none');
    setToken(data.token);
    if (activeSecret) {
      setAuthSecret(activeSecret);
    }
    return data.token;
  } catch (err) {
    console.log('[auth] fetchToken error:', err);
    return null;
  }
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
