import { getAuthToken } from './authApi';
import logger from '../utils/logger';

const API_BASE_URL = (import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081/api').replace(/\/$/, '');

const fallbackAchievers = [
  {
    id: 1,
    name: 'Aditya Rawat',
    branch: 'Computer Science & Engineering',
    batch: '2024',
    cgpa: '9.64',
    achievementTitle: 'GATE CS AIR 148 & Software Engineer',
    quote: 'Focusing on core CS fundamentals like Algorithms and OS from 2nd year made cracking GATE and tech interviews seamless.',
    companyOrExam: 'IIT Bombay / Microsoft',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    badgeLabel: 'GATE TOPPER',
  },
  {
    id: 2,
    name: 'Priya Bhatt',
    branch: 'Information Technology',
    batch: '2024',
    cgpa: '9.78',
    achievementTitle: 'University Gold Medalist & SDE at Oracle',
    quote: 'ByteCollege syllabus navigator and past year papers kept me aligned throughout my semester exams.',
    companyOrExam: 'Oracle Cloud Systems',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
    badgeLabel: 'GOLD MEDALIST',
  },
  {
    id: 3,
    name: 'Rohan Negi',
    branch: 'Electronics & Communication',
    batch: '2025',
    cgpa: '9.42',
    achievementTitle: 'Smart India Hackathon Winner 2024',
    quote: 'Consistency matters more than cramming. Utilize every resource, solve PYQs, and build practical projects.',
    companyOrExam: 'SIH Champion / Qualcomm Intern',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    badgeLabel: 'HACKATHON WINNER',
  },
  {
    id: 4,
    name: 'Sneha Joshi',
    branch: 'Computer Science & Engineering',
    batch: '2023',
    cgpa: '9.55',
    achievementTitle: 'Placed at Amazon (AWS) - 44 LPA',
    quote: 'Start DSA early, maintain a healthy CGPA above 8.5, and never skip university semester mock tests.',
    companyOrExam: 'Amazon AWS',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
    badgeLabel: 'TOP PLACEMENT',
  }
];

export async function getAchievers() {
  try {
    const res = await fetch(`${API_BASE_URL}/achievers`);
    if (!res.ok) return fallbackAchievers;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : fallbackAchievers;
  } catch (err) {
    logger.warn('Achievers fetch fallback to local data', { error: err?.message });
    return fallbackAchievers;
  }
}

export async function saveAchiever(achiever) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/admin/achievers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(achiever)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Failed to save achiever profile.');
  }
  return data;
}

export async function deleteAchiever(id) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/admin/achievers/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete achiever.');
  }
  return data;
}
