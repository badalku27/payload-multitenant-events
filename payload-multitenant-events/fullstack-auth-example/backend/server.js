require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { 
  login, 
  refreshAccessToken, 
  logout, 
  getUserById, 
  authenticateToken, 
  requireRole 
} = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 login attempts per windowMs
});

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication endpoints
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await login(email, password);
    
    res.json({
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/auth/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const tokens = refreshAccessToken(refreshToken);
    
    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      logout(refreshToken);
    }
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected user endpoints
app.get('/api/user', authenticateToken, (req, res) => {
  try {
    const user = getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.get('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const user = getUserById(req.user.id);
    res.json({
      ...user,
      lastLogin: new Date().toISOString(),
      tokenExp: req.user.exp
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Admin-only endpoint
app.get('/api/admin/users', authenticateToken, requireRole(['admin']), (req, res) => {
  const { users } = require('./auth');
  const publicUsers = users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }));
  
  res.json({ users: publicUsers });
});

// User update endpoint
app.put('/api/user', authenticateToken, (req, res) => {
  try {
    const { name } = req.body;
    const { users } = require('./auth');
    
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) {
      users[userIndex].name = name;
    }

    const updatedUser = getUserById(req.user.id);
    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔐 CORS enabled for: ${process.env.FRONTEND_URL}`);
  console.log(`\nTest credentials:`);
  console.log(`Admin: admin@example.com / password`);
  console.log(`User: user@example.com / password`);
});
