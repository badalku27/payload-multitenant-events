// Vanilla JavaScript example for non-React applications
class SimpleAuthHandler {
  constructor() {
    this.apiBase = 'http://localhost:3005/api';
  }

  // Check token validity before making requests
  async checkAndRefreshToken() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      this.redirectToLogin();
      return null;
    }

    // Simple token expiry check (assumes JWT)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp <= now) {
        console.log('Token expired, attempting refresh...');
        return await this.refreshToken();
      }
      
      return token;
    } catch (error) {
      console.error('Invalid token format:', error);
      this.redirectToLogin();
      return null;
    }
  }

  // Refresh token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      this.redirectToLogin();
      return null;
    }

    try {
      const response = await fetch(`${this.apiBase}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        return data.accessToken;
      } else {
        throw new Error('Refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.redirectToLogin();
      return null;
    }
  }

  // Make authenticated API call
  async fetchUser() {
    const token = await this.checkAndRefreshToken();
    
    if (!token) return null;

    try {
      const response = await fetch(`${this.apiBase}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // Try refresh once more
        const newToken = await this.refreshToken();
        if (newToken) {
          // Retry with new token
          const retryResponse = await fetch(`${this.apiBase}/user`, {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (retryResponse.ok) {
            return await retryResponse.json();
          }
        }
        
        this.redirectToLogin();
        return null;
      }

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Fetch user failed:', error);
      throw error;
    }
  }

  // Redirect to login
  redirectToLogin() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.setItem('redirectUrl', window.location.pathname);
    window.location.href = '/login';
  }
}

// Usage example
const authHandler = new SimpleAuthHandler();

// Fetch user data
authHandler.fetchUser()
  .then(user => {
    if (user) {
      console.log('User data:', user);
      // Update UI with user data
      document.getElementById('userInfo').innerHTML = `
        <h3>Welcome, ${user.name || user.email}</h3>
        <p>Email: ${user.email}</p>
      `;
    }
  })
  .catch(error => {
    console.error('Error:', error);
    document.getElementById('userInfo').innerHTML = '<p>Failed to load user data</p>';
  });

// Export for use in other files
window.authHandler = authHandler;
