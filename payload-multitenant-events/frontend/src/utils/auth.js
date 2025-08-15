// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005';

// Token storage utilities
export const TokenManager = {
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  },
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
};

// Enhanced fetch function with automatic token refresh
export const fetchWithAuth = async (url, options = {}) => {
  const makeRequest = async (token) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  };

  let accessToken = TokenManager.getAccessToken();
  const refreshToken = TokenManager.getRefreshToken();

  // If no tokens, make request without auth
  if (!accessToken && !refreshToken) {
    return makeRequest();
  }

  // If access token is expired but we have refresh token, try to refresh
  if (TokenManager.isTokenExpired(accessToken) && refreshToken) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        TokenManager.setTokens(data.accessToken);
        accessToken = data.accessToken;
      } else {
        // Refresh failed, clear tokens and continue without auth
        TokenManager.clearTokens();
        accessToken = null;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      TokenManager.clearTokens();
      accessToken = null;
    }
  }

  // Make the actual request
  let response = await makeRequest(accessToken);

  // If we get 401 and haven't tried refreshing yet, try once more
  if (response.status === 401 && accessToken && refreshToken) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        TokenManager.setTokens(data.accessToken);
        response = await makeRequest(data.accessToken);
      } else {
        TokenManager.clearTokens();
      }
    } catch (error) {
      console.error('Retry token refresh failed:', error);
      TokenManager.clearTokens();
    }
  }

  return response;
};
