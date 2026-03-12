import axios from 'axios';
import type {
  Asset,
  User,
  Company,
  MaintenanceLog,
  Notification,
  LoginResponse,
  PaginatedResponse,
  PaginationParams,
  AssetFilters,
} from '@fieldvault/types';

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
    api.post<{ data: LoginResponse }>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ data: LoginResponse }>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};

// ─── Dashboard API ──────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get('/dashboard'),
};

// ─── Assets API ─────────────────────────────────────
export const assetsApi = {
  list: (params?: AssetFilters) =>
    api.get<{ data: PaginatedResponse<Asset> }>('/assets', { params }),
  get: (id: string) => api.get<{ data: Asset }>(`/assets/${id}`),
  create: (data: Partial<Asset>) => api.post<{ data: Asset }>('/assets', data),
  update: (id: string, data: Partial<Asset>) => api.patch<{ data: Asset }>(`/assets/${id}`, data),
  archive: (id: string) => api.delete(`/assets/${id}`),
  getQrCode: (id: string) => api.get<{ data: { qrCode: string } }>(`/assets/${id}/qr-code`),
};

// ─── Users API ──────────────────────────────────────
export const usersApi = {
  list: (params?: PaginationParams) =>
    api.get<{ data: PaginatedResponse<User> }>('/users', { params }),
  get: (id: string) => api.get<{ data: User }>(`/users/${id}`),
  invite: (data: { name: string; email: string; role: string }) =>
    api.post<{ data: User }>('/users/invite', data),
  update: (id: string, data: Partial<User>) => api.patch<{ data: User }>(`/users/${id}`, data),
  remove: (id: string) => api.delete(`/users/${id}`),
};

// ─── Maintenance API ────────────────────────────────
export const maintenanceApi = {
  list: (params?: PaginationParams) =>
    api.get<{ data: PaginatedResponse<MaintenanceLog> }>('/maintenance', { params }),
  listOverdue: () => api.get<{ data: MaintenanceLog[] }>('/maintenance/overdue'),
  create: (data: Partial<MaintenanceLog>) =>
    api.post<{ data: MaintenanceLog }>('/maintenance', data),
  update: (id: string, data: Partial<MaintenanceLog>) =>
    api.patch<{ data: MaintenanceLog }>(`/maintenance/${id}`, data),
  remove: (id: string) => api.delete(`/maintenance/${id}`),
};

// ─── Notifications API ──────────────────────────────
export const notificationsApi = {
  list: (params?: PaginationParams) =>
    api.get<{ data: PaginatedResponse<Notification> }>('/notifications', { params }),
  unreadCount: () => api.get<{ data: { count: number } }>('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// ─── Reports API ────────────────────────────────────
export const reportsApi = {
  auditReport: (months?: number) => api.get('/reports/audit', { params: { months } }),
  auditReportPdf: (months?: number) =>
    api.get('/reports/audit/pdf', { params: { months }, responseType: 'blob' }),
  inventoryReport: () => api.get('/reports/inventory'),
};

// ─── Companies API ──────────────────────────────────
export const companiesApi = {
  getMyCompany: () => api.get<{ data: Company }>('/companies/me'),
  getStats: () => api.get('/companies/me/stats'),
  update: (data: Partial<Company>) => api.patch<{ data: Company }>('/companies/me', data),
};

