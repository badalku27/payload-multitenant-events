const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Test configuration
const API_BASE_URL = 'http://localhost:5000';
const TEST_USER = {
  email: 'admin@example.com',
  password: 'password'
};

// Test utilities
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`)
};

// Test functions
async function testHealthEndpoint() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    if (response.ok && data.status === 'OK') {
      log.success('Health endpoint working');
      return true;
    } else {
      log.error('Health endpoint failed');
      return false;
    }
  } catch (error) {
    log.error(`Health endpoint error: ${error.message}`);
    return false;
  }
}

async function testLogin() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER),
    });

    const data = await response.json();

    if (response.ok && data.accessToken && data.refreshToken) {
      log.success('Login successful');
      return {
        success: true,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user
      };
    } else {
      log.error(`Login failed: ${data.error || 'Unknown error'}`);
      return { success: false };
    }
  } catch (error) {
    log.error(`Login error: ${error.message}`);
    return { success: false };
  }
}

async function testProtectedEndpoint(accessToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.id) {
      log.success('Protected endpoint working');
      log.info(`User: ${data.name} (${data.email}) - Role: ${data.role}`);
      return true;
    } else {
      log.error(`Protected endpoint failed: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    log.error(`Protected endpoint error: ${error.message}`);
    return false;
  }
}

async function testTokenRefresh(refreshToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (response.ok && data.accessToken) {
      log.success('Token refresh working');
      return {
        success: true,
        accessToken: data.accessToken
      };
    } else {
      log.error(`Token refresh failed: ${data.error || 'Unknown error'}`);
      return { success: false };
    }
  } catch (error) {
    log.error(`Token refresh error: ${error.message}`);
    return { success: false };
  }
}

async function testInvalidToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/me`, {
      headers: {
        'Authorization': 'Bearer invalid-token',
      },
    });

    if (response.status === 401) {
      log.success('Invalid token properly rejected');
      return true;
    } else {
      log.error('Invalid token was accepted');
      return false;
    }
  } catch (error) {
    log.error(`Invalid token test error: ${error.message}`);
    return false;
  }
}

async function testUserUpdate(accessToken) {
  try {
    const newName = `Test User ${Date.now()}`;
    
    const response = await fetch(`${API_BASE_URL}/api/user/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName }),
    });

    const data = await response.json();

    if (response.ok && data.user && data.user.name === newName) {
      log.success('User update working');
      return true;
    } else {
      log.error(`User update failed: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    log.error(`User update error: ${error.message}`);
    return false;
  }
}

async function testLogout(refreshToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      log.success('Logout working');
      return true;
    } else {
      log.error('Logout failed');
      return false;
    }
  } catch (error) {
    log.error(`Logout error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log(`${colors.blue}🧪 Starting JWT Authentication Tests${colors.reset}\n`);

  let passedTests = 0;
  let totalTests = 0;

  const runTest = async (testName, testFn) => {
    totalTests++;
    log.info(`Testing: ${testName}`);
    const result = await testFn();
    if (result) passedTests++;
    console.log('');
    return result;
  };

  // Test server health
  const healthOk = await runTest('Server Health', testHealthEndpoint);
  if (!healthOk) {
    log.error('Server is not running. Please start the server first.');
    process.exit(1);
  }

  // Test authentication flow
  const loginResult = await runTest('User Login', testLogin);
  if (!loginResult.success) {
    log.error('Cannot continue without successful login');
    process.exit(1);
  }

  const { accessToken, refreshToken } = loginResult;

  // Test protected endpoint
  await runTest('Protected Endpoint', () => testProtectedEndpoint(accessToken));

  // Test token refresh
  const refreshResult = await runTest('Token Refresh', () => testTokenRefresh(refreshToken));
  const newAccessToken = refreshResult.success ? refreshResult.accessToken : accessToken;

  // Test invalid token rejection
  await runTest('Invalid Token Rejection', testInvalidToken);

  // Test user update
  await runTest('User Update', () => testUserUpdate(newAccessToken));

  // Test logout
  await runTest('User Logout', () => testLogout(refreshToken));

  // Final results
  console.log(`${colors.blue}📊 Test Results${colors.reset}`);
  console.log(`Passed: ${colors.green}${passedTests}${colors.reset}`);
  console.log(`Failed: ${colors.red}${totalTests - passedTests}${colors.reset}`);
  console.log(`Total: ${totalTests}`);

  if (passedTests === totalTests) {
    console.log(`\n${colors.green}🎉 All tests passed!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}❌ Some tests failed${colors.reset}`);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    log.error(`Test runner error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testHealthEndpoint,
  testLogin,
  testProtectedEndpoint,
  testTokenRefresh,
  testInvalidToken,
  testUserUpdate,
  testLogout
};
