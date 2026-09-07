import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const AUTH_STORAGE_KEY = 'vitality_auth';

export const apiClient = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const token = raw ? JSON.parse(raw).token : null;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore malformed storage
  }
  return config;
});
