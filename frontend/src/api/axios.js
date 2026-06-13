import axios from 'axios';
import { translateApiError } from '../utils/apiErrors';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data;
    const status = err.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:logout'));
    }

    const fieldErrors = data?.errors ?? null;
    const code = data?.code ?? null;

    const firstValidationError = fieldErrors
      ? fieldErrors[Object.keys(fieldErrors)[0]]?.[0]
      : undefined;

    const rawMessage =
      firstValidationError ?? data?.message ?? 'An unexpected error occurred';

    const message = translateApiError(rawMessage, undefined, code);

    const error = new Error(message);
    error.code = code;
    error.fieldErrors = fieldErrors;
    error.rawMessage = rawMessage;

    return Promise.reject(error);
  },
);

export default api;
