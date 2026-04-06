const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('iwr_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    if (response.status === 401) {
      localStorage.removeItem('iwr_token');
      localStorage.removeItem('iwr_user');
      window.location.href = '/';
    }
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export function get<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'GET' });
}

export function post<T>(endpoint: string, body?: Record<string, unknown>): Promise<T> {
  return request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
}

export function patch<T>(endpoint: string, body?: Record<string, unknown>): Promise<T> {
  return request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
}
