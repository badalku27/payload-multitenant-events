const jwt = require('jsonwebtoken');
const { promisify } = require('util');

// Promisify jwt methods for async/await
const verifyAsync = promisify(jwt.verify);
const signAsync = promisify(jwt.sign);

// Mock user database (replace with your actual database)
const users = [
  {
    id: 1,
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: 2,
    email: 'user@example.com',
    name: 'John Doe',
    role: 'user'
  }
];

// In-memory refresh token store (use Redis or database in production)
const refreshTokenStore = new Set();

// Generate JWT tokens
const generateTokens = async (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  try {
    const accessToken = await signAsync(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = await signAsync(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Store refresh token
    refreshTokenStore.add(refreshToken);

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error('Token generation failed');
  }
};

// Verify access token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // Verify the access token
    const decoded = await verifyAsync(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Find user (in production, query your database)
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Attach user to request
    req.user = user;
    req.tokenPayload = decoded;
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid access token',
        code: 'TOKEN_INVALID'
      });
    }

    return res.status(401).json({ 
      error: 'Token verification failed',
      code: 'TOKEN_VERIFICATION_FAILED'
    });
  }
};

// Verify refresh token and generate new access token
const refreshAccessToken = async (refreshToken) => {
  try {
    // Check if refresh token exists in store
    if (!refreshTokenStore.has(refreshToken)) {
      throw new Error('Refresh token not found or revoked');
    }

    // Verify refresh token
    const decoded = await verifyAsync(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Find user
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new access token (keep the same refresh token)
    const accessToken = await signAsync(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    return { accessToken, user };
  } catch (error) {
    // Remove invalid refresh token from store
    refreshTokenStore.delete(refreshToken);
    throw error;
  }
};

// Revoke refresh token (logout)
const revokeRefreshToken = (refreshToken) => {
  refreshTokenStore.delete(refreshToken);
};

// Get user by ID
const getUserById = (id) => {
  return users.find(u => u.id === id);
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  generateTokens,
  refreshAccessToken,
  revokeRefreshToken,
  getUserById,
  requireRole,
  users,
  refreshTokenStore
};
