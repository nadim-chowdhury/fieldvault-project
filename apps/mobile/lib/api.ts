import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  register: (data: { companyName: string; name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard'),
};

export const assetsApi = {
  list: (params?: Record<string, any>) => api.get('/assets', { params }),
  get: (id: string) => api.get(`/assets/${id}`),
  getQrCode: (id: string) => api.get(`/assets/${id}/qr-code`),
};

export const assignmentsApi = {
  active: () => api.get('/assignments/active'),
  checkout: (data: { assetId: string; siteLocation: string; conditionOnCheckout?: string }) =>
    api.post('/assignments/checkout', data),
  checkin: (id: string, data: { conditionOnReturn?: string }) =>
    api.post(`/assignments/${id}/checkin`, data),
};

export const notificationsApi = {
  list: () => api.get('/notifications'),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
};
