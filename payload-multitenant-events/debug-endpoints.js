// Debug script to test Payload CMS API endpoints
// Run this to diagnose the "Fetching user failed" error

const testPayloadEndpoints = async () => {
  const baseURL = 'http://localhost:3005';
  
  console.log('🔍 Testing Payload CMS endpoints...\n');
  
  // Test basic connectivity
  try {
    console.log('1. Testing basic connectivity...');
    const response = await fetch(`${baseURL}/admin`);
    console.log(`✅ Admin endpoint status: ${response.status}`);
    
    // Test API endpoints
    console.log('\n2. Testing API endpoints...');
    
    // Check if users endpoint is accessible
    const usersResponse = await fetch(`${baseURL}/api/users`);
    console.log(`📊 Users API status: ${usersResponse.status}`);
    
    if (usersResponse.status === 200) {
      const usersData = await usersResponse.json();
      console.log(`📝 Users count: ${usersData.docs?.length || 0}`);
    } else {
      console.log(`❌ Users API error: ${usersResponse.statusText}`);
      const errorText = await usersResponse.text();
      console.log(`Error details: ${errorText.substring(0, 200)}...`);
    }
    
    // Test initialization endpoint
    console.log('\n3. Testing initialization...');
    const initResponse = await fetch(`${baseURL}/api/users/init`);
    console.log(`🚀 Init status: ${initResponse.status}`);
    
    if (initResponse.status === 200) {
      const initData = await initResponse.json();
      console.log(`🎯 Initialization required: ${initData.initialized === false}`);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('- Check if server is running on port 3005');
    console.log('- Verify MongoDB connection');
    console.log('- Check firewall/antivirus blocking localhost');
    console.log('- Try in incognito/private browser window');
  }
};

// Node.js fetch polyfill
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

testPayloadEndpoints();
