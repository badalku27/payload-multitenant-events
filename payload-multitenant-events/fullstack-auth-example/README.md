# 🔐 Fullstack JWT Authentication Example

A complete JWT authentication system with automatic token refresh, proper error handling, and role-based access control.

## 📁 Project Structure

```
fullstack-auth-example/
│
├── backend/                 # Node.js + Express API
│   ├── server.js           # Main server file
│   ├── auth.js             # Authentication logic
│   ├── .env                # Environment variables
│   └── package.json        # Backend dependencies
│
└── frontend/               # React application
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api.js          # API client with interceptors
    │   ├── App.js          # Main app with routing
    │   ├── Login.js        # Login component
    │   ├── Profile.js      # User profile component
    │   └── index.js        # React entry point
    └── package.json        # Frontend dependencies
```

## 🚀 Quick Start

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

4. **Server will run on:** http://localhost:5000

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the React app:**
   ```bash
   npm start
   ```

4. **App will run on:** http://localhost:3000

## 🔑 Test Credentials

### Admin User
- **Email:** admin@example.com
- **Password:** password
- **Permissions:** Can view all users, admin panel access

### Regular User
- **Email:** user@example.com
- **Password:** password
- **Permissions:** Can view own profile only

## 🛡️ Security Features

### JWT Implementation
- **Access Token:** Short-lived (15 minutes)
- **Refresh Token:** Long-lived (7 days)
- **Automatic Refresh:** Tokens refresh automatically before expiry
- **Secure Storage:** Tokens stored in localStorage with proper validation

### API Security
- **CORS Protection:** Configured for frontend origin
- **Rate Limiting:** 100 requests per 15 minutes, 5 login attempts per 15 minutes
- **Helmet Security:** Security headers applied
- **Input Validation:** Email and password validation
- **Error Handling:** Proper error responses without sensitive data

### Authentication Flow
1. **Login:** User provides credentials → Server validates → Returns JWT tokens
2. **API Requests:** Client sends access token in Authorization header
3. **Token Validation:** Server validates token on each protected request
4. **Token Refresh:** Client automatically refreshes expired access tokens
5. **Logout:** Client clears tokens, server invalidates refresh token

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/user` - Get current user info
- `GET /api/user/profile` - Get detailed user profile
- `PUT /api/user` - Update user information

### Admin Only
- `GET /api/admin/users` - Get all users (admin only)

### Utility
- `GET /health` - Health check endpoint

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-too
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables (optional)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🧪 Testing the Authentication Flow

1. **Start both backend and frontend servers**
2. **Navigate to** http://localhost:3000
3. **Try logging in with test credentials**
4. **Observe automatic redirects and token management**
5. **Check browser developer tools for API calls**
6. **Test token refresh by waiting 15 minutes**
7. **Test logout functionality**

## 🔄 Token Refresh Mechanism

### Automatic Refresh
- **Client-side:** Checks token expiry before each request
- **Buffer Time:** 5-minute buffer before actual expiry
- **Retry Logic:** Automatically retries failed requests with new token
- **Fallback:** Redirects to login if refresh fails

### Manual Testing
- Tokens expire every 15 minutes
- Watch browser network tab to see refresh requests
- Profile page shows remaining token time

## 🎯 Key Features Demonstrated

### Frontend
- ✅ **React Context for auth state**
- ✅ **Protected routes**
- ✅ **Automatic token refresh**
- ✅ **Error handling and retry logic**
- ✅ **Loading states**
- ✅ **Role-based UI**

### Backend
- ✅ **JWT token generation and validation**
- ✅ **Refresh token rotation**
- ✅ **Role-based access control**
- ✅ **Rate limiting**
- ✅ **Security best practices**
- ✅ **Proper error responses**

## 🚧 Production Considerations

### Backend
- Use a real database instead of in-memory storage
- Store refresh tokens in Redis or database
- Use environment-specific JWT secrets
- Implement proper logging
- Add input sanitization
- Use HTTPS in production
- Implement account lockout after failed attempts

### Frontend
- Use secure token storage (consider httpOnly cookies)
- Implement proper error boundaries
- Add loading skeletons
- Use environment-specific API URLs
- Implement proper form validation
- Add accessibility features

## 🐛 Common Issues & Solutions

### CORS Errors
- Ensure backend FRONTEND_URL matches frontend port
- Check that CORS is properly configured

### Token Refresh Loops
- Check token expiry validation logic
- Ensure refresh token is valid and not expired

### 401 Errors
- Verify JWT secrets match between requests
- Check token format and structure

### Connection Refused
- Ensure both servers are running
- Check port configurations
- Verify firewall settings

## 📚 Learning Resources

This example demonstrates:
- JWT authentication best practices
- React authentication patterns
- Express.js security middleware
- Automatic token refresh
- Role-based access control
- Error handling strategies

Perfect for learning modern authentication workflows!
