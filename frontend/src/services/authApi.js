const USERS_KEY = 'bytestudy.auth.users.v2';
const LEGACY_USERS_KEY = 'bytestudy.auth.users.v1';
const SESSION_KEY = 'bytestudy.auth.session.v1';
const API_BASE_URL = (import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081/api').replace(/\/$/, '');

export const isAdminAccount = (account = {}) => {
  const role = account?.role || '';

  return role.toUpperCase() === 'ADMIN';
};

const readJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error('Your browser could not save this account. Please allow site storage and try again.');
  }
};

const normaliseLoginId = (value = '') => value.trim().toUpperCase().replace(/\s+/g, '');
const normaliseEmail = (value = '') => value.trim().toLowerCase();
const normaliseIdentity = (value = '') => {
  const cleanValue = value.trim();
  return cleanValue.includes('@') ? normaliseEmail(cleanValue) : normaliseLoginId(cleanValue);
};

const randomSegment = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const values = new Uint32Array(6);

  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(values);
    return Array.from(values, (value) => alphabet[value % alphabet.length]).join('');
  }

  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
};

const createUniqueLoginId = (users) => {
  const existingIds = new Set(users.map((user) => user.loginId));
  const year = new Date().getFullYear();
  let loginId = '';

  do {
    loginId = `BTP-${year}-${randomSegment()}`;
  } while (existingIds.has(loginId));

  return loginId;
};

const hashPassword = async (password) => {
  const encoded = new TextEncoder().encode(`bytestudy-local-auth-v1:${password}`);

  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  return btoa(unescape(encodeURIComponent(`bytestudy-local-auth-v1:${password}`)));
};

const sessionFromUser = ({ token = '', refreshToken = '', loginId, name, email, role, isOnboarded = false, targetCgpa = 8.50 }) => ({
  token,
  refreshToken,
  loginId,
  name,
  email,
  role,
  isOnboarded,
  targetCgpa,
});

const saveSession = (user) => {
  writeJson(SESSION_KEY, sessionFromUser(user));
};

const getLocalUsers = () => {
  const users = readJson(USERS_KEY, null);
  if (users) return users;

  // Preserve accounts created by the first version of the local development adapter.
  const legacyUsers = readJson(LEGACY_USERS_KEY, []);
  const migratedUsers = legacyUsers.map((user) => ({
    ...user,
    email: user.email || '',
  }));
  if (migratedUsers.length) writeJson(USERS_KEY, migratedUsers);
  return migratedUsers;
};

const request = async (path, payload, { session = true } = {}) => {
  const token = getAuthToken();
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Cannot reach the BytePath API. Check the backend URL and CORS settings, then try again.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'We could not complete that request. Please try again.');
  }

  if (!session) return data;
  if (!data.loginId || !data.name) {
    throw new Error('The authentication service returned an incomplete account response.');
  }

  return sessionFromUser(data);
};

export const getActiveSession = () => readJson(SESSION_KEY, null);

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
    role: params.get('role') || 'STUDENT'
  });
  saveSession(session);
  window.history.replaceState({}, document.title, window.location.pathname);
  return session;
};

export const getAuthToken = () => getActiveSession()?.token || '';

export async function updateAcademicProfile(profile) {
  const token = getAuthToken();
  if (!token) return null;
  const response = await fetch(`${API_BASE_URL}/academic/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
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
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    clearActiveSession();
    throw new Error(data.message || 'Your session has expired. Please sign in again.');
  }
  const session = sessionFromUser(data);
  saveSession(session);
  return session;
}

export const clearActiveSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // The visible application state should still update when browser storage is unavailable.
  }
};

export const isValidLoginId = (value) => /^BTP-\d{4}-[A-Z0-9]{6}$/.test(normaliseLoginId(value));
export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normaliseEmail(value));
export const hasRemoteAuthApi = () => Boolean(API_BASE_URL);

export async function verifyEmail(token) {
  if (!token) throw new Error('This verification link is missing its token.');
  const session = await request('/auth/verify-email', { token });
  saveSession(session);
  return session;
}

export const startGithubSignIn = () => {
  window.location.assign(`${API_BASE_URL}/auth/github/start`);
};

/**
 * Uses VITE_AUTH_API_URL when configured. Without it, this is a local-development
 * adapter so the screen remains usable before a backend is connected.
 */
export async function registerAccount({ name, email, password }) {
  const cleanName = name.trim().replace(/\s+/g, ' ');
  const cleanEmail = normaliseEmail(email);

  if (cleanName.length < 2) throw new Error('Enter your full name (at least 2 characters).');
  if (!isValidEmail(cleanEmail)) throw new Error('Enter a valid Google account email address.');
  if (password.length < 8) throw new Error('Use a password with at least 8 characters.');

  if (hasRemoteAuthApi()) {
    return request('/auth/register', { name: cleanName, email: cleanEmail, password }, { session: false });
  }

  const users = getLocalUsers();
  if (users.some((user) => normaliseEmail(user.email) === cleanEmail)) {
    throw new Error('An account already exists for that Google email. Please sign in instead.');
  }

  const user = {
    loginId: createUniqueLoginId(users),
    name: cleanName,
    email: cleanEmail,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  writeJson(USERS_KEY, [...users, user]);
  saveSession(user);
  return sessionFromUser(user);
}

export async function signIn({ identity, password }) {
  const cleanIdentity = normaliseIdentity(identity);

  if (!cleanIdentity) throw new Error('Enter your unique ByteStudy ID or Google email.');
  if (!password) throw new Error('Enter your password.');

  if (hasRemoteAuthApi()) {
    const session = await request('/auth/login', { identity: cleanIdentity, password });
    saveSession(session);
    return session;
  }

  const users = getLocalUsers();
  const user = users.find((account) => (
    account.loginId === normaliseLoginId(cleanIdentity)
    || (account.email && normaliseEmail(account.email) === cleanIdentity)
  ));

  if (!user || user.passwordHash !== await hashPassword(password)) {
    throw new Error('That unique ID / Google email or password is incorrect.');
  }

  saveSession(user);
  return sessionFromUser(user);
}

export async function signInWithGoogleCredential(credential) {
  if (!credential) throw new Error('Google did not return a credential. Please try again.');
  if (hasRemoteAuthApi()) {
    const session = await request('/auth/google', { credential });
    saveSession(session);
    return session;
  }
  // Local fallback decoding if JWT token is provided locally
  try {
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    return await signInWithGoogleProfile({
      name: payload.name || payload.given_name || 'Google Scholar',
      email: payload.email,
      picture: payload.picture
    });
  } catch {
    throw new Error('Google sign-in credential invalid. Please try again.');
  }
}

export async function signInWithGoogleAccessToken(accessToken) {
  if (!accessToken) throw new Error('Google did not return an access token. Please try again.');
  const session = await request('/auth/google/access-token', { accessToken });
  saveSession(session);
  return session;
}

/**
 * Handles Google sign-in or account creation via Google Profile data
 * for local development and demo testing.
 */
export async function signInWithGoogleProfile({ name, email, picture }) {
  if (hasRemoteAuthApi()) {
    throw new Error('Google OAuth is not configured in this frontend. Add VITE_GOOGLE_CLIENT_ID and use the Google button again.');
  }
  const cleanEmail = normaliseEmail(email);
  if (!isValidEmail(cleanEmail)) throw new Error('Invalid Google account email address.');

  const users = getLocalUsers();
  let user = users.find((acc) => normaliseEmail(acc.email) === cleanEmail);

  if (!user) {
    const cleanName = (name || 'Google Scholar').trim();
    user = {
      loginId: createUniqueLoginId(users),
      name: cleanName,
      email: cleanEmail,
      picture: picture || '',
      passwordHash: await hashPassword('google-auth-provider'),
      createdAt: new Date().toISOString(),
      isGoogleAuth: true
    };
    writeJson(USERS_KEY, [...users, user]);
  }

  saveSession(user);
  return sessionFromUser(user);
}
