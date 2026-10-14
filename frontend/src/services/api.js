import axios from 'axios';

// Backend URL from environment (e.g., Render URL https://campus-lost-and-found-backend.onrender.com)
// In local development, if VITE_API_URL is unset, it defaults to empty string so Vite proxy handles /api & /uploads
const RAW_URL = import.meta.env.VITE_API_URL || '';
export const BACKEND_URL = RAW_URL.replace(/\/+$/, '');
const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

const API = axios.create({
  baseURL: API_BASE,
  timeout: 35000,
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

// Response interceptor with automatic retry on cold starts and friendly error mapping
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const status = error.response?.status;
    const isColdStart =
      !error.response ||
      status === 502 ||
      status === 503 ||
      status === 504 ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK';

    // Auto-retry once for cold-starts on cloud free tier
    if (isColdStart && config && !config._retry) {
      config._retry = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return await API(config);
      } catch (retryErr) {
        error = retryErr;
      }
    }

    // Ensure error.response.data has a meaningful message string for UI
    if (!error.response) {
      error.response = { data: {} };
    }
    if (!error.response.data || typeof error.response.data !== 'object') {
      error.response.data = {};
    }
    if (!error.response.data.message) {
      if (isColdStart) {
        error.response.data.message =
          'Server is waking up from idle state. Please try again in a few seconds.';
      } else {
        error.response.data.message = error.message || 'Request failed. Please try again.';
      }
    }

    return Promise.reject(error);
  }
);

export default API;
