import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach JWT ────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Response interceptor: handle 401 ───────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// ─── Auth API ───────────────────────────────────────
export const authApi = {
  register: (data: { companyName: string; name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

// ─── Dashboard API ──────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get('/dashboard'),
};

// ─── Assets API ─────────────────────────────────────
export const assetsApi = {
  list: (params?: { search?: string; status?: string; category?: string; page?: number; limit?: number }) =>
    api.get('/assets', { params }),
  get: (id: string) => api.get(`/assets/${id}`),
  create: (data: any) => api.post('/assets', data),
  update: (id: string, data: any) => api.patch(`/assets/${id}`, data),
  archive: (id: string) => api.delete(`/assets/${id}`),
  getQrCode: (id: string) => api.get(`/assets/${id}/qr-code`),
};

// ─── Users API ──────────────────────────────────────
export const usersApi = {
  list: () => api.get('/users'),
  get: (id: string) => api.get(`/users/${id}`),
  invite: (data: { name: string; email: string; role: string }) =>
    api.post('/users/invite', data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  remove: (id: string) => api.delete(`/users/${id}`),
};

// ─── Maintenance API ────────────────────────────────
export const maintenanceApi = {
  list: () => api.get('/maintenance'),
  listOverdue: () => api.get('/maintenance/overdue'),
  create: (data: any) => api.post('/maintenance', data),
  update: (id: string, data: any) => api.patch(`/maintenance/${id}`, data),
  remove: (id: string) => api.delete(`/maintenance/${id}`),
};

// ─── Notifications API ──────────────────────────────
export const notificationsApi = {
  list: () => api.get('/notifications'),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// ─── Reports API ────────────────────────────────────
export const reportsApi = {
  auditReport: (months?: number) => api.get('/reports/audit', { params: { months } }),
  inventoryReport: () => api.get('/reports/inventory'),
};

// ─── Companies API ──────────────────────────────────
export const companiesApi = {
  getMyCompany: () => api.get('/companies/me'),
  getStats: () => api.get('/companies/me/stats'),
  update: (data: any) => api.patch('/companies/me', data),
};
