// Central axios instance with auth header + base URL from .env
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Attach JWT if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Optional: auto-logout on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('kp_token');
    }
    return Promise.reject(err);
  }
);

export default api;
