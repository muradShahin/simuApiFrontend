import axios from 'axios';

/**
 * Axios instance.
 * In development Vite proxies /api and /mock to localhost:8080,
 * so we use an empty baseURL (relative requests).
 * For production builds set VITE_API_BASE_URL accordingly.
 */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60_000,
});

// Restore token from localStorage on app load
const savedToken = localStorage.getItem('simuapi_token');
if (savedToken) {
  client.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      (typeof err.response?.data === 'string' ? err.response.data : null) ||
      err.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default client;
