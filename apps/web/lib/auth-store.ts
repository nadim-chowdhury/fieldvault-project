import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  avatarUrl?: string;
}

interface Company {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isActive: boolean;
}

interface AuthState {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  login: (user: User, company: Company, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  company: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('company') || 'null') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false,

  login: (user, company, tokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('company', JSON.stringify(company));
    set({ user, company, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    set({ user: null, company: null, isAuthenticated: false });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));
