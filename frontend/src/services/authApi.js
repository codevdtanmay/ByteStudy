const SESSION_KEY = 'bytestudy.auth.session.v1';
const API_BASE_URL = (import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081/api').replace(/\/$/, '');

export const isAdminAccount = (account = {}) => (account?.role || '').toUpperCase() === 'ADMIN';

const readJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const sessionFromUser = ({ token = '', refreshToken = '', loginId, name, email, role, isOnboarded = false, targetCgpa = 8.50 }) => ({
  token, refreshToken, loginId, name, email, role, isOnboarded, targetCgpa,
});

const saveSession = (user) => writeJson(SESSION_KEY, sessionFromUser(user));

const request = async (path, payload) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Authentication failed. Please try again.');
    if (!data.loginId || !data.name) throw new Error('The authentication service returned an incomplete account response.');
    return sessionFromUser(data);
  } catch (error) {
    if (controller.signal.aborted) throw new Error('The authentication request timed out. Please try again.');
    if (error instanceof TypeError) throw new Error('Cannot reach the BytePath authentication service.');
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
};

export const getActiveSession = () => readJson(SESSION_KEY, null);
export const getAuthToken = () => getActiveSession()?.token || '';
export const hasRemoteAuthApi = () => Boolean(API_BASE_URL);

export const clearActiveSession = () => {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore storage cleanup failures */ }
};

export const consumeOAuthSession = () => {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
  const params = new URLSearchParams(hash || window.location.search);
  const oauthError = params.get('error');
  if (oauthError) {
    window.history.replaceState({}, document.title, window.location.pathname);
    return null;
  }
  const token = params.get('token');
  const loginId = params.get('loginId');
  if (!token || !loginId) return null;
  const session = sessionFromUser({
    token,
    loginId,
    name: params.get('name') || 'ByteStudy Scholar',
    email: params.get('email') || '',
    role: params.get('role') || 'STUDENT',
  });
  saveSession(session);
  window.history.replaceState({}, document.title, window.location.pathname);
  return session;
};

export const startGithubSignIn = () => {
  window.location.assign(`${API_BASE_URL}/auth/github/start`);
};

export async function signInWithGoogleAccessToken(accessToken) {
  if (!accessToken) throw new Error('Google did not return an access token. Please try again.');
  const session = await request('/auth/google/access-token', { accessToken });
  saveSession(session);
  return session;
}

export async function signInWithGoogleCredential(credential) {
  if (!credential) throw new Error('Google did not return a credential. Please try again.');
  const session = await request('/auth/google', { credential });
  saveSession(session);
  return session;
}

export async function updateAcademicProfile(profile) {
  const token = getAuthToken();
  if (!token) return null;
  const response = await fetch(`${API_BASE_URL}/academic/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(profile),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Could not save your academic profile.');
  return data;
}

export async function refreshActiveSession() {
  const current = getActiveSession();
  if (!current?.refreshToken) throw new Error('Your session has expired. Please sign in again.');
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { clearActiveSession(); throw new Error(data.message || 'Your session has expired. Please sign in again.'); }
  const session = sessionFromUser(data); saveSession(session); return session;
}
