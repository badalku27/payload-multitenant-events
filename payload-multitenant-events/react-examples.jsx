// Example usage in React components
import React, { useState, useEffect } from 'react';
import { api, authManager } from './auth.js';

// User Profile Component
const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await api.getUser();
      setUser(userData);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (updates) => {
    try {
      setError(null);
      
      const updatedUser = await api.updateUser(updates);
      setUser(updatedUser);
      
      alert('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
      console.error('Failed to update user:', err);
    }
  };

  if (loading) return <div>Loading user profile...</div>;
  
  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={fetchUser}>Retry</button>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      {user && (
        <div>
          <p>Email: {user.email}</p>
          <p>Name: {user.name}</p>
          <button onClick={() => handleUpdateUser({ name: 'New Name' })}>
            Update Name
          </button>
        </div>
      )}
      <button onClick={api.logout}>Logout</button>
    </div>
  );
};

// Login Component
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      await api.login(email, password);
      
      // Redirect to original page or dashboard
      const redirectUrl = localStorage.getItem('redirectUrl') || '/dashboard';
      localStorage.removeItem('redirectUrl');
      window.location.href = redirectUrl;
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      authManager.redirectToLogin();
    }
  }, []);

  if (!authManager.isAuthenticated()) {
    return <div>Redirecting to login...</div>;
  }

  return children;
};

export { UserProfile, Login, ProtectedRoute };
