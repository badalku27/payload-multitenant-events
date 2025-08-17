import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Profile from './Profile';
import { authAPI } from './api';

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    if (authAPI.isAuthenticated()) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      await authAPI.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await authAPI.login(email, password);
      setUser(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <header style={{ 
            padding: '1rem', 
            backgroundColor: '#f5f5f5', 
            borderBottom: '1px solid #ddd' 
          }}>
            <h1>🔐 JWT Authentication Demo</h1>
          </header>

          <main style={{ padding: '2rem' }}>
            <Routes>
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/" 
                element={<Navigate to="/profile" />} 
              />
              <Route 
                path="*" 
                element={<div>404 - Page not found</div>} 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Public Route (redirect to profile if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/profile" /> : children;
};

export default App;
