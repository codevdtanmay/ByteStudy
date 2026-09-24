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
  if (!response.ok) throw new Error(data.message || 'The video could not be saved.');
  return data;
}

export function getStudentVideos(semester) {
  return request(`/student-videos/semester/${semester}`);
}

export function addStudentVideo({ semesterNumber, courseCode, url }) {
  return request('/student-videos', {
    method: 'POST',
    body: JSON.stringify({ semesterNumber, courseCode, url }),
  });
}

export function deleteStudentVideo(id) {
  return request(`/student-videos/${id}`, { method: 'DELETE' });
}
