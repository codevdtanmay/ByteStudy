import { getAuthToken, refreshActiveSession } from './authApi';

const API_BASE_URL = (import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081/api').replace(/\/$/, '');

async function request(path, options = {}, canRefresh = true) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok && canRefresh && (response.status === 401 || response.status === 403) && getAuthToken()) {
    await refreshActiveSession();
    return request(path, options, false);
  }
  if (!response.ok) throw new Error(data.message || 'Feedback could not be submitted.');
  return data;
}

export function submitFeedback(feedback) {
  return request('/feedback', { method: 'POST', body: JSON.stringify(feedback) });
}

export function getFeedback() {
  return request('/feedback');
}
