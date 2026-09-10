import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const AUTH_STORAGE_KEY = 'vitality_auth';

export const apiClient = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const AUTH_ENDPOINT_PATHS = ['/auth/login', '/auth/register', '/auth/social', '/auth/demo', '/auth/forgot-password', '/auth/reset-password', '/user/password'];

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url ?? '';
    const isAuthEndpoint = AUTH_ENDPOINT_PATHS.some((path) => url.includes(path));
    if (error.response?.status === 401 && !isAuthEndpoint) {
      const hadSession = !!localStorage.getItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      if (hadSession) {
        window.dispatchEvent(new CustomEvent('vitality:session-expired'));
      }
    }
    return Promise.reject(error);
  }
);
