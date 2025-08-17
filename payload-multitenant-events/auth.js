// auth.js - JWT Token Management and API Helper
class AuthManager {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3005/api';
    this.tokenKey = 'authToken';
    this.refreshTokenKey = 'refreshToken';
  }

  // Get token from localStorage
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Get refresh token from localStorage  
  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  // Store tokens
  setTokens(token, refreshToken) {
    localStorage.setItem(this.tokenKey, token);
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  // Clear all tokens
  clearTokens() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  // Check if token is expired
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      // Decode JWT payload (base64)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token expires within next 5 minutes (300 seconds buffer)
      return payload.exp < (currentTime + 300);
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

  // Refresh the access token
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Store new tokens
      this.setTokens(data.accessToken, data.refreshToken);
      
      return data.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      throw error;
    }
  }

  // Main API call method with automatic token handling
  async apiCall(endpoint, options = {}) {
    let token = this.getToken();

    // Check if token is expired and try to refresh
    if (this.isTokenExpired(token)) {
      console.log('Token expired, attempting refresh...');
      
      try {
        token = await this.refreshAccessToken();
        console.log('Token refreshed successfully');
      } catch (error) {
        console.error('Token refresh failed, redirecting to login');
        this.redirectToLogin();
        throw new Error('Authentication failed');
      }
    }

    // Prepare request options
    const requestOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, requestOptions);

      // Handle 401 errors (token might be invalid)
      if (response.status === 401) {
        console.log('401 error, attempting token refresh...');
        
        try {
          // Try to refresh token once more
          token = await this.refreshAccessToken();
          
          // Retry the original request with new token
          requestOptions.headers.Authorization = `Bearer ${token}`;
          const retryResponse = await fetch(`${this.baseURL}${endpoint}`, requestOptions);
          
          if (retryResponse.status === 401) {
            // Still 401, redirect to login
            this.redirectToLogin();
            throw new Error('Authentication failed after retry');
          }
          
          return this.handleResponse(retryResponse);
          
        } catch (refreshError) {
          console.error('Token refresh failed on retry:', refreshError);
          this.redirectToLogin();
          throw new Error('Authentication failed');
        }
      }

      return this.handleResponse(response);

    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Handle API response
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } else {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.text();
    }
  }

  // Redirect to login page
  redirectToLogin() {
    this.clearTokens();
    
    // For React Router
    if (window.location.pathname !== '/login') {
      // Store current location for redirect after login
      localStorage.setItem('redirectUrl', window.location.pathname);
      window.location.href = '/login';
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    return token && !this.isTokenExpired(token);
  }
}

// Create singleton instance
const authManager = new AuthManager();

// Specific API methods
export const api = {
  // Get current user
  async getUser() {
    return authManager.apiCall('/user');
  },

  // Update user
  async updateUser(userData) {
    return authManager.apiCall('/user', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Login
  async login(email, password) {
    const response = await fetch(`${authManager.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    authManager.setTokens(data.accessToken, data.refreshToken);
    
    return data;
  },

  // Logout
  logout() {
    authManager.clearTokens();
    window.location.href = '/login';
  },

  // Generic API call
  call: (endpoint, options) => authManager.apiCall(endpoint, options),
};

// Export auth manager for direct access
export { authManager };

// Export default
export default api;
