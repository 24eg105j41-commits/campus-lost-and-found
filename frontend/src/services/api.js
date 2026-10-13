import axios from 'axios';

// Backend URL from environment (e.g., Render URL https://campus-lost-and-found-backend.onrender.com)
// In local development, if VITE_API_URL is unset, it defaults to empty string so Vite proxy handles /api & /uploads
const RAW_URL = import.meta.env.VITE_API_URL || '';
export const BACKEND_URL = RAW_URL.replace(/\/+$/, '');
const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

const API = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Resolves item image paths to proper URLs across dev (Vite proxy)
 * and production (Vercel frontend calling Render backend).
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('data:') ||
    imagePath.startsWith('blob:')
  ) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return BACKEND_URL ? `${BACKEND_URL}${cleanPath}` : cleanPath;
};

// Attach JWT Bearer token if user is authenticated
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration or errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
