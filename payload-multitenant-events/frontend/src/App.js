import React, { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth, TokenManager } from './utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005';

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

  const fillDemoCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@example.com');
      setPassword('password');
    } else {
      setEmail('user@example.com');
      setPassword('password');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>🔐 Login</h2>
        
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
            placeholder="Enter your email"
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
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? '🔄 Logging in...' : '🚀 Login'}
        </button>

        <div className="demo-credentials">
          <h4>Demo Credentials:</h4>
          <p onClick={() => fillDemoCredentials('admin')}>
            👑 admin@example.com / password
          </p>
          <p onClick={() => fillDemoCredentials('user')}>
            👤 user@example.com / password
          </p>
        </div>
      </form>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ user, onUpdateUser, onLogout }) => {
  const [name, setName] = useState(user?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiResponse, setApiResponse] = useState('');
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
  }, [user]);

  const handleUpdate = async () => {
    console.log('Update function called with name:', name);
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await onUpdateUser({ name: name.trim() });
      console.log('Update result:', result);

      if (result.success) {
        setSuccess('✅ Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError('Update failed: ' + error.message);
    }

    setIsLoading(false);
  };

  const testAPI = async (endpoint, method = 'GET') => {
    setApiLoading(true);
    setApiResponse('Loading...');

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
        method,
      });

      const data = await response.json();
      
      setApiResponse(JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        data: data
      }, null, 2));
    } catch (error) {
      setApiResponse(`Error: ${error.message}`);
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>👋 Welcome, {user.name}!</h2>
        <button onClick={onLogout} className="logout-btn">
          🚪 Logout
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

      <div className="dashboard-grid">
        {/* User Profile Card */}
        <div className="dashboard-card">
          <h3>👤 User Profile</h3>
          
          <div className="info-row">
            <label>Email:</label>
            <span>{user.email}</span>
          </div>

          <div className="info-row">
            <label>Role:</label>
            <span className={`role-badge role-${user.role}`}>
              {user.role === 'admin' ? '👑' : '👤'} {user.role}
            </span>
          </div>

          <div className="profile-edit-form">
            <div className="info-row">
              <label>Name:</label>
              {isEditing ? (
                <div className="edit-group">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    required
                    placeholder="Enter your name"
                    style={{ padding: '8px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <button 
                    onClick={handleUpdate}
                    disabled={isLoading || !name.trim()} 
                    className="save-btn"
                    style={{ backgroundColor: '#28a745', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px', marginRight: '5px' }}
                  >
                    {isLoading ? '⏳ Saving...' : '💾 Save'}
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name);
                      setError('');
                    }}
                    disabled={isLoading}
                    className="cancel-btn"
                    style={{ backgroundColor: '#dc3545', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px' }}
                  >
                    ❌ Cancel
                  </button>
                </div>
              ) : (
                <div className="edit-group">
                  <span style={{ marginRight: '15px', fontWeight: 'bold' }}>{user.name}</span>
                  <button 
                    onClick={() => {
                      console.log('Edit button clicked');
                      setIsEditing(true);
                    }}
                    className="edit-btn"
                    style={{ backgroundColor: '#007bff', color: 'white', padding: '6px 10px', border: 'none', borderRadius: '4px' }}
                  >
                    ✏️ Edit Name
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Token Information Card */}
        <div className="dashboard-card">
          <h3>🔑 Token Information</h3>
          <div className="info-row">
            <label>Token Expires:</label>
            <span>{new Date(user.tokenExp * 1000).toLocaleString()}</span>
          </div>
          <div className="info-row">
            <label>Token Issued:</label>
            <span>{new Date(user.tokenIat * 1000).toLocaleString()}</span>
          </div>
          <div className="info-row">
            <label>Auto Refresh:</label>
            <span>✅ Enabled</span>
          </div>
        </div>

        {/* API Testing Card */}
        <div className="dashboard-card">
          <h3>🧪 API Testing</h3>
          <p>Test the JWT authentication endpoints:</p>
          
          <div className="api-test-section">
            <div className="api-buttons">
              <button 
                className="api-btn" 
                onClick={() => testAPI('/health')}
                disabled={apiLoading}
              >
                🏥 Health Check
              </button>
              <button 
                className="api-btn" 
                onClick={() => testAPI('/api/user/me')}
                disabled={apiLoading}
              >
                👤 Get Profile
              </button>
              {user.role === 'admin' && (
                <button 
                  className="api-btn" 
                  onClick={() => testAPI('/api/admin/users')}
                  disabled={apiLoading}
                >
                  👑 Admin Users
                </button>
              )}
            </div>
            
            {apiResponse && (
              <div className="api-response">
                {apiResponse}
              </div>
            )}
          </div>
        </div>

        {/* Features Card */}
        <div className="dashboard-card">
          <h3>🚀 Features</h3>
          <div className="info-row">
            <label>✅ JWT Authentication</label>
            <span>15min tokens</span>
          </div>
          <div className="info-row">
            <label>🔄 Auto Token Refresh</label>
            <span>7-day refresh</span>
          </div>
          <div className="info-row">
            <label>🛡️ Role-based Access</label>
            <span>Admin/User roles</span>
          </div>
          <div className="info-row">
            <label>🔒 Security Headers</label>
            <span>CORS, Helmet, Rate Limiting</span>
          </div>
          <div className="info-row">
            <label>📱 Responsive Design</label>
            <span>Mobile-friendly UI</span>
          </div>
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
        <div className="loading-spinner">🔄 Loading...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔐 JWT Authentication Demo</h1>
        {error && (
          <div className="global-error">
            {error}
          </div>
        )}
      </header>

      <main className="app-main">
        {isAuthenticated ? (
          <Dashboard 
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

export default App;
