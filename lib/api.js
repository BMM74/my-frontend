import axios from 'axios';
import { router } from 'expo-router';
import { getToken, removeToken } from './auth';

const api = axios.create({ baseURL: 'https://nue-backend-production.up.railway.app' });

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const url = err.config?.url || '';
    const isAuthRoute = url.includes('/auth/');
    if (err.response?.status === 401 && !isAuthRoute) {
      await removeToken();
      router.replace('/(auth)/welcome');
    }
    return Promise.reject(err);
  }
);

export default api;
