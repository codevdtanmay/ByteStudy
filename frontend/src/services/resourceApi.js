import { getAuthToken, refreshActiveSession } from './authApi';

const API_BASE_URL = (import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081/api').replace(/\/$/, '');

const jsonRequest = async (path, options = {}, canRefresh = true) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok && canRefresh && (response.status === 401 || response.status === 403) && getAuthToken()) {
    await refreshActiveSession();
    return jsonRequest(path, options, false);
  }
  if (!response.ok) {
    const error = new Error(data.message || 'The resource request failed.');
    error.status = response.status;
    throw error;
  }
  return data;
};

export async function uploadStudyFile({ file, title, semesterNumber, courseCode, examType = 'GENERAL', examYear }) {
  const init = await jsonRequest('/pyqs/upload-init', {
    method: 'POST',
    body: JSON.stringify({
      title,
      semesterNumber: Number(semesterNumber),
      courseCode,
      originalFilename: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      examType,
      examYear: examYear ? Number(examYear) : null,
    }),
  });

  const form = new FormData();
  form.append('file', file);
  const upload = await fetch(`${API_BASE_URL}${init.uploadUrl}`, {
    method: 'PUT',
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
    body: form,
  });
  if (!upload.ok) throw new Error('The file could not be uploaded to storage.');

  return jsonRequest(`/pyqs/${init.resourceId}/complete`, { method: 'POST' });
}

export function getStudyFileUrl(resourceId) {
  return jsonRequest(`/pyqs/${resourceId}/access-url`, { method: 'GET' });
}

export async function getProtectedStudyFile(resourceId) {
  const response = await fetch(`${API_BASE_URL}/pyqs/${resourceId}/view`, {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  if (!response.ok) throw new Error('The protected resource could not be opened.');
  return response.blob();
}

export function getStudyResources(semesterNumber) {
  return jsonRequest(semesterNumber ? `/pyqs/semester/${semesterNumber}` : '/pyqs');
}

export function deleteStudyResource(resourceId) {
  return jsonRequest(`/pyqs/${resourceId}`, { method: 'DELETE' });
}
