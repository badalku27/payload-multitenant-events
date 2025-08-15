# JWT Authentication System

**Author: Badal Kumar**

A complete JWT-based authentication system with React frontend and Node.js/Express backend. Features secure token management, user profiles, role-based access control, and automatic token refresh.

## 🚀 Features

- **Secure JWT Authentication**: 15-minute access tokens with 7-day refresh tokens
- **Role-Based Access Control**: User and admin roles with protected routes
- **Automatic Token Refresh**: Seamless token renewal without user interruption
- **User Profile Management**: View and edit user profiles with validation
- **Security Features**: CORS protection, rate limiting, and Helmet middleware
- **Responsive React Frontend**: Modern UI with authentication state management

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (version 14 or higher)
- npm or yarn package manager
- Git (for cloning the repository)

## 🛠️ Step-by-Step Setup Instructions

### 1. Clone the Repository

```powershell
git clone https://github.com/badalku27/payload-multitenant-events.git
cd payload-multitenant-events
```

### 2. Install Backend Dependencies

```powershell
npm install
```

The following packages will be installed:
- `express` - Web framework
- `jsonwebtoken` - JWT token handling
- `bcryptjs` - Password hashing
- `cors` - Cross-origin resource sharing
- `helmet` - Security middleware
- `express-rate-limit` - Rate limiting
- `dotenv` - Environment variables

### 3. Install Frontend Dependencies

```powershell
cd frontend
npm install
```

The following packages will be installed:
- `react` - Frontend framework
- `react-dom` - React DOM manipulation
- `react-scripts` - React build tools

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```powershell
# In the root directory
echo 'JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
PORT=3005' > .env
```

**Important**: Replace the secrets with your own secure random strings in production.

### 5. Start the Backend Server

```powershell
# From the root directory
node jwt-server.js
```

You should see:
```
Server running on port 3005
```

### 6. Start the Frontend Application

Open a new terminal window:

```powershell
# Navigate to frontend directory
cd frontend
npm start
```

The React app will open at `http://localhost:3001`

## 🔐 Demo Credentials

The system comes with pre-configured demo users:

### Regular User
- **Email**: `user@example.com`
- **Password**: `password123`
- **Role**: user

### Admin User
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: admin

## 🎯 How to Use

### 1. Access the Application
- Open your browser and go to `http://localhost:3001`
- You'll see the login form

### 2. Login
- Use one of the demo credentials above
- Click "Login" button
- You'll be redirected to your profile page

### 3. Profile Management
- View your user information
- Click "Edit Profile" to modify your details
- Save changes or cancel to revert

### 4. Admin Features (Admin users only)
- Access to admin dashboard
- User management capabilities
- Additional administrative tools

### 5. Logout
- Click "Logout" to end your session
- All tokens will be cleared

## 🏗️ Project Structure

```
payload-multitenant-events/
├── jwt-server.js              # Main backend server
├── auth-middleware.js         # JWT authentication middleware
├── package.json              # Backend dependencies
├── .env                      # Environment variables
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── App.js           # Main React component
│   │   ├── auth-styles.css  # Styling
│   │   └── index.js         # React entry point
│   ├── public/              # Static files
│   └── package.json         # Frontend dependencies
└── README.md                # This file
```

## 🔧 API Endpoints

### Authentication Endpoints

#### POST `/api/login`
Login with email and password
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/api/refresh`
Refresh access token using refresh token
```json
{
  "refreshToken": "your-refresh-token"
}
```

#### POST `/api/logout`
Logout and invalidate refresh token
```json
{
  "refreshToken": "your-refresh-token"
}
```

### User Endpoints

#### GET `/api/profile`
Get current user profile (requires authentication)

#### PUT `/api/profile`
Update user profile (requires authentication)
```json
{
  "name": "New Name",
  "email": "new@example.com"
}
```

#### GET `/api/users`
Get all users (admin only)

### Protected Routes

All API endpoints except `/api/login` require a valid JWT token in the Authorization header:
```
Authorization: Bearer your-jwt-token
```

## 🔒 Security Features

- **JWT Tokens**: Secure authentication with short-lived access tokens
- **Password Hashing**: Bcrypt for secure password storage
- **CORS Protection**: Configured for frontend domain
- **Rate Limiting**: Prevents brute force attacks
- **Helmet**: Adds various HTTP security headers
- **Token Refresh**: Automatic token renewal for seamless user experience

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
If you get `EADDRINUSE` error:

```powershell
# Kill process on port 3005
netstat -ano | findstr :3005
taskkill /F /PID <PID_NUMBER>
```

#### Frontend Not Loading
- Make sure backend is running on port 3005
- Check that frontend is running on port 3001
- Verify CORS settings in `jwt-server.js`

#### Authentication Errors
- Check JWT secrets in `.env` file
- Verify tokens haven't expired
- Clear browser storage and try again

### Debug Mode

To run with debug information:

```powershell
# Backend with debug
DEBUG=* node jwt-server.js

# Frontend with debug
cd frontend
REACT_APP_DEBUG=true npm start
```

## 🔄 Development Workflow

### Making Changes

1. **Backend Changes**:
   - Modify `jwt-server.js` or `auth-middleware.js`
   - Restart the server: `Ctrl+C` then `node jwt-server.js`

2. **Frontend Changes**:
   - Modify files in `frontend/src/`
   - Changes will hot-reload automatically

### Testing

Test the API endpoints using tools like:
- Postman
- curl commands
- Browser developer tools

Example curl command:
```bash
curl -X POST http://localhost:3005/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## 🚀 Production Deployment

### Environment Setup

1. Set production environment variables
2. Use strong, unique JWT secrets
3. Configure proper CORS origins
4. Set up HTTPS
5. Use a process manager like PM2

### Build Frontend

```powershell
cd frontend
npm run build
```

### Deploy

The built files can be served by the Express server or a static file server.

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the error logs in the terminal
3. Create an issue on GitHub
4. Contact: Badal Kumar

## 🙏 Acknowledgments

Built with modern web technologies:
- React.js for the frontend
- Express.js for the backend
- JWT for secure authentication
- Bcrypt for password security

---

**Happy Coding! 🎉**
