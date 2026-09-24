const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
// Production must register this exact URL in the Spotify developer dashboard.
// Falling back to the current origin keeps mobile deployments from redirecting
// back to localhost when the environment variable is omitted.
const configuredRedirectUri = (import.meta.env.VITE_SPOTIFY_REDIRECT_URI || '').trim();
const REDIRECT_URI = configuredRedirectUri && !(window.location.hostname !== 'localhost' && configuredRedirectUri.includes('localhost'))
  ? configuredRedirectUri
  : `${window.location.origin}/focus`;
const TOKEN_KEY = 'bytepath.spotify.token.v1';
const VERIFIER_KEY = 'bytepath.spotify.pkce.verifier.v1';
const STATE_KEY = 'bytepath.spotify.pkce.state.v1';

const readToken = () => {
  try {
    const token = JSON.parse(sessionStorage.getItem(TOKEN_KEY) || 'null');
    return token && token.expiresAt > Date.now() + 30_000 ? token : null;
  } catch { return null; }
};

const writeToken = (data) => {
  const token = { ...data, expiresAt: Date.now() + (data.expires_in * 1000) };
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  return token;
};

const base64Url = (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const sha256 = async (value) => base64Url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
const randomString = (length = 64) => { const bytes = new Uint8Array(length); crypto.getRandomValues(bytes); return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(''); };
const readResponse = async (response) => {
  const text = await response.text();
  try { return text ? JSON.parse(text) : {}; } catch { return { message: text }; }
};

export const spotifyIsConfigured = () => Boolean(CLIENT_ID);

export const spotifyLogin = async () => {
  if (!CLIENT_ID) throw new Error('Add VITE_SPOTIFY_CLIENT_ID to frontend/.env first.');
  const verifier = randomString();
  const state = randomString(16);
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);
  // Mobile OAuth flows can restore the page in a fresh browsing context.
  // Keep a same-origin fallback so the callback can still verify the request.
  localStorage.setItem(VERIFIER_KEY, verifier);
  localStorage.setItem(STATE_KEY, state);
  const params = new URLSearchParams({ client_id: CLIENT_ID, response_type: 'code', redirect_uri: REDIRECT_URI, scope: 'streaming user-read-email user-read-private', code_challenge_method: 'S256', code_challenge: await sha256(verifier), state });
  window.location.assign(`https://accounts.spotify.com/authorize?${params}`);
};

export const spotifyHandleCallback = async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) return null;
  const state = params.get('state');
  const expectedState = sessionStorage.getItem(STATE_KEY) || localStorage.getItem(STATE_KEY);
  const verifier = sessionStorage.getItem(VERIFIER_KEY) || localStorage.getItem(VERIFIER_KEY);
  window.history.replaceState({}, document.title, window.location.pathname);
  if (!state || state !== expectedState || !verifier) throw new Error('Spotify sign-in could not be verified. Please try again.');
  const response = await fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: CLIENT_ID, grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI, code_verifier: verifier }) });
  const data = await readResponse(response);
  if (!response.ok) throw new Error(data.error_description || 'Spotify sign-in failed.');
  sessionStorage.removeItem(VERIFIER_KEY); sessionStorage.removeItem(STATE_KEY);
  localStorage.removeItem(VERIFIER_KEY); localStorage.removeItem(STATE_KEY);
  return writeToken(data);
};

export const spotifyLogout = () => sessionStorage.removeItem(TOKEN_KEY);
export const spotifyHasToken = () => Boolean(readToken());

export const spotifySearch = async (query) => {
  const token = readToken();
  if (!token) throw new Error('Connect Spotify to search your music.');
  const response = await fetch(`https://api.spotify.com/v1/search?${new URLSearchParams({ q: query, type: 'track,playlist', limit: '8' })}`, { cache: 'no-store', headers: { Authorization: `Bearer ${token.access_token}` } });
  if (response.status === 401) { spotifyLogout(); throw new Error('Your Spotify session expired. Connect again.'); }
  if (response.status === 304) return { tracks: { items: [] }, playlists: { items: [] } };
  const data = await readResponse(response);
  if (!response.ok) {
    if (response.status === 401) spotifyLogout();
    throw new Error(data.error?.message || data.message || `Spotify search failed (${response.status}).`);
  }
  return { tracks: data.tracks || { items: [] }, playlists: data.playlists || { items: [] } };
};

export const spotifyTrackEmbedUrl = (url) => {
  const match = url.trim().match(/open\.spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
  return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0` : '';
};
