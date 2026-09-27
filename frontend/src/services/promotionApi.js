import { getAuthToken } from './authApi';
import logger from '../utils/logger';

const API_BASE_URL = (import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081/api').replace(/\/$/, '');

const defaultPromotion = {
  active: true,
  bannerHeadline: 'Special Offer for You All! Up to 50% OFF on all End-Sem Passes',
  discountPercentage: 50,
  freeSemesters: '',
  freeSemesterList: [],
  freeTrialActive: false,
  freeTrialDays: 5,
  freeTrialExpiresAt: null,
  badgeText: 'LIMITED TIME OFFER',
};

export async function getActivePromotion() {
  try {
    const res = await fetch(`${API_BASE_URL}/promotions/active`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      return defaultPromotion;
    }
    const data = await res.json();
    return data;
  } catch (error) {
    logger.warn('Failed to load active promotion from backend, using defaults', { error: error?.message });
    return defaultPromotion;
  }
}

export async function updatePromotion(settings) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/admin/promotions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(settings),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update promotional offers.');
  }
  return data;
}

export async function grantSubscription({ email, plan = 'END_SEM_LIFETIME', semester = null, durationDays = null, note = '' }) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/admin/subscriptions/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      email,
      plan,
      semester: semester ? Number(semester) : null,
      durationDays: durationDays ? Number(durationDays) : null,
      note,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Failed to grant subscription.');
  }
  return data;
}

export async function revokeSubscription(email) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/admin/subscriptions/revoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Failed to revoke subscription.');
  }
  return data;
}

export async function getRecentSubscriptions() {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/admin/subscriptions`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => []);
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch subscription records.');
  }
  return Array.isArray(data) ? data : [];
}
