// src/store/authStore.ts
import { create } from 'zustand';
import axios from '../config/axios';

interface User {
  id?: string;
  memberId?: string;
  email?: string;
  name?: string;
  role: 'ADMIN' | 'MEMBER';
  isFirstLogin?: boolean;
  language?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  language: string;
  setAuth: (user: User) => void;
  setLanguage: (lang: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  language: localStorage.getItem('preferredLanguage') || 'en',

  setAuth: (user: User) => {
    console.log('Setting auth state for user:', user);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  setLanguage: (lang: string) => {
    localStorage.setItem('preferredLanguage', lang);
    set({ language: lang });
  },

  logout: async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Found stored user:', parsedUser);
        set({ user: parsedUser, isAuthenticated: true });
      } catch (e) {
        console.error('Error parsing stored user');
      }
    }
    
    try {
      const response = await axios.get('/api/auth/me');
      console.log('Auth check response:', response.data);
      if (response.data.user) {
        set({ user: response.data.user, isAuthenticated: true });
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        // Clear invalid state
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  }
}));