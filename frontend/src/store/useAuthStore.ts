import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  phone: string | null;
  linkedin: string | null;
  portfolio: string | null;
  bio: string | null;
  settings: Record<string, any> | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (access_token: string, refresh_token: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,

  login: (access_token: string, refresh_token: string) => {
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    set({ isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/api/auth/me');
      set({ user: response.data, isAuthenticated: true });
    } catch (error: any) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
