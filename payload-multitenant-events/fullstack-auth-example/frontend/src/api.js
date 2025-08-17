import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Token management
const getToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < (currentTime + 300); // 5 min buffer
  } catch {
    return true;
  }
};

// Refresh token function
const refreshToken = async () => {
  const refreshTokenValue = getRefreshToken();
  
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken: refreshTokenValue
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    setTokens(accessToken, newRefreshToken);
    
    return accessToken;
  } catch (error) {
    clearTokens();
    window.location.href = '/login';
    throw error;
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    let token = getToken();

    // Check if token is expired and refresh if needed
    if (token && isTokenExpired(token)) {
      try {
        token = await refreshToken();
      } catch (error) {
        // Refresh failed, redirect to login
        return Promise.reject(error);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  // Login
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      const { user, accessToken, refreshToken } = response.data;
      setTokens(accessToken, refreshToken);
      
      return { user, accessToken, refreshToken };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  // Logout
  logout: async () => {
    try {
      const refreshTokenValue = getRefreshToken();
      
      if (refreshTokenValue) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {
          refreshToken: refreshTokenValue
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = getToken();
    return token && !isTokenExpired(token);
  },

  // Get current user
  getCurrentUser: () => api.get('/user'),

  // Get user profile
  getUserProfile: () => api.get('/user/profile'),

  // Update user
  updateUser: (data) => api.put('/user', data),

  // Admin: Get all users
  getAllUsers: () => api.get('/admin/users'),
};

// Export token management functions
export { getToken, clearTokens, isTokenExpired };

export default api;
