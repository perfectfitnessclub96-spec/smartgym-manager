import { create } from 'zustand';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

interface User {
  id: string;
  mobileNumber: string;
  role: 'ADMIN' | 'MEMBER';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOTP: (mobileNumber: string, role: string) => Promise<void>;
  verifyOTP: (mobileNumber: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  sendOTP: async (mobileNumber, role) => {
    await axios.post('/auth/send-otp', { mobileNumber, role });
  },

  verifyOTP: async (mobileNumber, otp) => {
    const response = await axios.post('/auth/verify-otp', { mobileNumber, otp });
    if (response.data.user) {
      set({ user: response.data.user, isAuthenticated: true });
    }
  },

  logout: async () => {
    await axios.post('/auth/logout');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const response = await axios.get('/auth/me');
      if (response.data.user) {
        set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  }
}));