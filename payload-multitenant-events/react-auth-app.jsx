import React, { useState, useEffect, useCallback } from 'react';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Token storage utilities
const TokenManager = {
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
const fetchWithAuth = async (url, options = {}) => {
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

// Authentication hook
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        TokenManager.setTokens(data.accessToken, data.refreshToken);
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        setError(data.error || 'Login failed');
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      const errorMessage = 'Network error during login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      
      // Notify server about logout
      await fetchWithAuth(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      TokenManager.clearTokens();
      setUser(null);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/user/me`);
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
        TokenManager.clearTokens();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
      TokenManager.clearTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/user/me`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        setError(data.error || 'Update failed');
        return { success: false, error: data.error || 'Update failed' };
      }
    } catch (error) {
      const errorMessage = 'Network error during update';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const accessToken = TokenManager.getAccessToken();
    const refreshToken = TokenManager.getRefreshToken();

    if (accessToken || refreshToken) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };
};

// Login Component
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await onLogin(email, password);

    if (!result.success) {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <div className="demo-credentials">
          <h4>Demo Credentials:</h4>
          <p>admin@example.com / password</p>
          <p>user@example.com / password</p>
        </div>
      </form>
    </div>
  );
};

// Profile Component
const Profile = ({ user, onUpdateUser, onLogout }) => {
  const [name, setName] = useState(user?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setName(user?.name || '');
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const result = await onUpdateUser({ name: name.trim() });

    if (result.success) {
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Profile</h2>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="profile-info">
        <div className="info-row">
          <label>Email:</label>
          <span>{user.email}</span>
        </div>

        <div className="info-row">
          <label>Role:</label>
          <span className={`role-badge role-${user.role}`}>
            {user.role}
          </span>
        </div>

        <form onSubmit={handleUpdate} className="name-form">
          <div className="info-row">
            <label>Name:</label>
            {isEditing ? (
              <div className="edit-controls">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button type="submit" disabled={isLoading || !name.trim()}>
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEditing(false);
                    setName(user.name);
                    setError('');
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="display-controls">
                <span>{user.name}</span>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(true)}
                  className="edit-btn"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="token-info">
        <h3>Token Information</h3>
        <div className="info-row">
          <label>Token Expires:</label>
          <span>{new Date(user.tokenExp * 1000).toLocaleString()}</span>
        </div>
        <div className="info-row">
          <label>Token Issued:</label>
          <span>{new Date(user.tokenIat * 1000).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const { user, loading, error, login, logout, updateUser, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>JWT Authentication Demo</h1>
        {error && (
          <div className="global-error">
            {error}
          </div>
        )}
      </header>

      <main className="app-main">
        {isAuthenticated ? (
          <Profile 
            user={user} 
            onUpdateUser={updateUser} 
            onLogout={logout} 
          />
        ) : (
          <Login onLogin={login} />
        )}
      </main>
    </div>
  );
};

// Export components and utilities
export default App;
export { useAuth, fetchWithAuth, TokenManager };
