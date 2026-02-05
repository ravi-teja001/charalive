/**
 * Railway API client - replaces Supabase for Postgres operations.
 * Uses JWT token from localStorage (set by AuthContext).
 */

import { environment } from './environment';

const getToken = () => localStorage.getItem('railway_token');

export async function apiFetch<T = unknown>(
  path: string,
  options: Omit<RequestInit, 'headers'> & { headers?: Record<string, string>; skipAuth?: boolean; timeoutMs?: number } = {}
): Promise<T> {
  const { skipAuth, headers: customHeaders, timeoutMs, ...fetchOptions } = options;
  const url = `${environment.apiBaseUrl}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders || {}),
  };
  const token = getToken();
  if (!skipAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let controller: AbortController | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  if (timeoutMs != null && timeoutMs > 0) {
    controller = new AbortController();
    timeoutId = setTimeout(() => controller!.abort(), timeoutMs);
  }
  const signal = controller?.signal;

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers,
      signal,
    });
    if (timeoutId) clearTimeout(timeoutId);
    if (!res.ok) {
      const text = await res.text();
      let err: { error?: string; message?: string } = { error: res.statusText };
      try {
        err = JSON.parse(text) || err;
      } catch {
        if (text && text.length < 200) err = { error: text };
      }
      throw new Error(err.error || err.message || `API error ${res.status}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  } catch (e: any) {
    if (timeoutId) clearTimeout(timeoutId);
    if (e?.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw e;
  }
}

export function setApiToken(token: string | null) {
  if (token) {
    localStorage.setItem('railway_token', token);
  } else {
    localStorage.removeItem('railway_token');
  }
}
