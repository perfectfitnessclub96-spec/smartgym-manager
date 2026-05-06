// src/config/axios.ts
import axios from 'axios';

// ✅ FIX: Use environment variable for API URL
// In development: http://localhost:5000
// In production: https://your-backend.onrender.com
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('🔧 API Base URL:', API_URL);
console.log('🔧 Environment:', import.meta.env.MODE);

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`📤 [${config.method?.toUpperCase()}] ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`📥 [${response.status}] ${response.config.url}`);
    return response;
  },
  (error) => {
    // ✅ IMPROVED: Better error messages for production
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
      console.error('❌ Cannot connect to server. Backend URL:', API_URL);
      
      // Only show alert in development mode
      if (import.meta.env.MODE === 'development') {
        alert('Cannot connect to server. Please make sure the backend server is running on port 5000');
      }
    } else if (error.response?.status === 403) {
      console.error('❌ Authentication error');
    } else if (error.response?.status === 401) {
      console.error('❌ Unauthorized - Please login again');
    }
    console.error(`❌ [API Error] ${error.code || error.response?.status || 'Network'} ${error.config?.url}`, error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;