const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// In-memory user storage (use database in production)
const users = [
  {
    id: 1,
    email: 'admin@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: 2,
    email: 'user@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Regular User',
    role: 'user'
  }
];

// Refresh tokens storage (use Redis or database in production)
const refreshTokens = new Set();

// Generate JWT tokens
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });

  return { accessToken, refreshToken };
};

// Verify JWT token
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Login function
const login = async (email, password) => {
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  const tokens = generateTokens(user);
  refreshTokens.add(tokens.refreshToken);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    ...tokens
  };
};

// Refresh token function
const refreshAccessToken = (refreshToken) => {
  if (!refreshTokens.has(refreshToken)) {
    throw new Error('Invalid refresh token');
  }

  try {
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens
    const tokens = generateTokens(user);
    
    // Remove old refresh token and add new one
    refreshTokens.delete(refreshToken);
    refreshTokens.add(tokens.refreshToken);

    return tokens;
  } catch (error) {
    refreshTokens.delete(refreshToken);
    throw new Error('Invalid refresh token');
  }
};

// Logout function
const logout = (refreshToken) => {
  refreshTokens.delete(refreshToken);
};

// Get user by ID
const getUserById = (id) => {
  const user = users.find(u => u.id === id);
  if (!user) {
    throw new Error('User not found');
  }
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
};

// Middleware to authenticate requests
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check user roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = {
  login,
  refreshAccessToken,
  logout,
  getUserById,
  authenticateToken,
  requireRole,
  users
};
