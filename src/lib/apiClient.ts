/**
 * Railway API client - replaces Supabase for Postgres operations.
 * Uses JWT token from localStorage (set by AuthContext).
 */

import { environment } from './environment';

const getToken = () => localStorage.getItem('railway_token');

export async function apiFetch<T = unknown>(
  path: string,
  options: Omit<RequestInit, 'headers'> & { headers?: Record<string, string>; skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, headers: customHeaders, ...fetchOptions } = options;
  const url = `${environment.apiBaseUrl}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders || {}),
  };
  const token = getToken();
  if (!skipAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || `API error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function setApiToken(token: string | null) {
  if (token) {
    localStorage.setItem('railway_token', token);
  } else {
    localStorage.removeItem('railway_token');
  }
}
