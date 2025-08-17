require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const {
  authenticateToken,
  generateTokens,
  refreshAccessToken,
  revokeRefreshToken,
  getUserById,
  requireRole,
  users
} = require('./auth-middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 attempts per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' }
});

app.use(express.json({ limit: '10mb' }));

// Environment variables validation
if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  console.error('❌ Required environment variables missing:');
  console.error('- ACCESS_TOKEN_SECRET');
  console.error('- REFRESH_TOKEN_SECRET');
  process.exit(1);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Login endpoint (for testing purposes)
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Simple password check (use bcrypt in production)
    const user = users.find(u => u.email === email);
    
    if (!user || password !== 'password') { // Demo password
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const tokens = await generateTokens(user);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
});

// Refresh token endpoint
app.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token is required',
        code: 'REFRESH_TOKEN_MISSING'
      });
    }

    const result = await refreshAccessToken(refreshToken);
    
    res.json({
      accessToken: result.accessToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error.message);
    
    if (error.message.includes('not found') || error.message.includes('revoked')) {
      return res.status(403).json({ 
        error: 'Invalid refresh token',
        code: 'REFRESH_TOKEN_INVALID'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        error: 'Refresh token expired',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }

    res.status(403).json({ 
      error: 'Token refresh failed',
      code: 'REFRESH_FAILED'
    });
  }
});

// Get current user endpoint
app.get('/api/user/me', authenticateToken, (req, res) => {
  try {
    res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      tokenExp: req.tokenPayload.exp,
      tokenIat: req.tokenPayload.iat
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to get user data',
      code: 'USER_FETCH_ERROR'
    });
  }
});

// Update user endpoint
app.put('/api/user/me', authenticateToken, (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Name is required',
        code: 'NAME_REQUIRED'
      });
    }

    // Find and update user (in production, update your database)
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    users[userIndex].name = name.trim();
    
    res.json({
      message: 'User updated successfully',
      user: {
        id: users[userIndex].id,
        email: users[userIndex].email,
        name: users[userIndex].name,
        role: users[userIndex].role
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      error: 'Failed to update user',
      code: 'USER_UPDATE_ERROR'
    });
  }
});

// Admin-only endpoint
app.get('/api/admin/users', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const publicUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }));
    
    res.json({ users: publicUsers });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Failed to get users',
      code: 'USERS_FETCH_ERROR'
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      revokeRefreshToken(refreshToken);
    }
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: `Endpoint ${req.method} ${req.originalUrl} not found`,
    code: 'ENDPOINT_NOT_FOUND'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`\nTest endpoints:`);
  console.log(`📡 Health: http://localhost:${PORT}/health`);
  console.log(`🔑 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`🔄 Refresh: POST http://localhost:${PORT}/refresh`);
  console.log(`👤 User: GET http://localhost:${PORT}/api/user/me`);
  console.log(`\nTest credentials:`);
  console.log(`📧 admin@example.com / password`);
  console.log(`📧 user@example.com / password`);
});
