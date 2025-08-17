import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './App';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/profile');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = (userType) => {
    if (userType === 'admin') {
      setEmail('admin@example.com');
      setPassword('password');
    } else {
      setEmail('user@example.com');
      setPassword('password');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div style={{
        padding: '2rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Login
        </h2>

        {error && (
          <div style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px' 
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>Test Credentials:</h4>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => fillTestCredentials('admin')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Fill Admin
            </button>
            <button
              onClick={() => fillTestCredentials('user')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Fill User
            </button>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
            <div>Admin: admin@example.com / password</div>
            <div>User: user@example.com / password</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
