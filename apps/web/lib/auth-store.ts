import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  avatarUrl?: string | null;
}

interface Company {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isActive: boolean;
  trialEndsAt?: string | null;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  company: Company | null;
  companies: Company[];
  isAuthenticated: boolean;
  login: (user: User, company: Company, companies: Company[], tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setCompany: (company: Company) => void;
  setCompanies: (companies: Company[]) => void;
  switchCompany: (company: Company, user: User, tokens: { accessToken: string; refreshToken: string }) => void;
  addCompany: (company: Company) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  company: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('company') || 'null') : null,
  companies: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('companies') || '[]') : [],
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false,

  login: (user, company, companies, tokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('company', JSON.stringify(company));
    localStorage.setItem('companies', JSON.stringify(companies));
    set({ user, company, companies, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    localStorage.removeItem('companies');
    set({ user: null, company: null, companies: [], isAuthenticated: false });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  setCompany: (company) => {
    localStorage.setItem('company', JSON.stringify(company));
    set({ company });
  },

  setCompanies: (companies) => {
    localStorage.setItem('companies', JSON.stringify(companies));
    set({ companies });
  },

  switchCompany: (company, user, tokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('company', JSON.stringify(company));
    localStorage.setItem('user', JSON.stringify(user));
    set({ company, user, isAuthenticated: true });
  },

  addCompany: (company) => {
    const current = get().companies;
    const updated = [...current, company];
    localStorage.setItem('companies', JSON.stringify(updated));
    set({ companies: updated });
  },
}));
