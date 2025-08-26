// Test script for backend with JWT authentication
const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3001';

// Test user ID (UUID format)
const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

// Generate a test JWT token
function generateTestToken(userId) {
  if (!process.env.JWT_SECRET) {
    console.log('⚠️  JWT_SECRET not found in environment. Using test secret.');
    return jwt.sign({ userId }, 'test-secret-for-development-only', { expiresIn: '1h' });
  }
  
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function testBackend() {
  console.log('🧪 Testing Bappa AI Backend with JWT Authentication...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health Check:', healthResponse.data);
    
    // Test 2: Chat without auth (should fail)
    console.log('\n2️⃣ Testing Chat without Auth (should fail)...');
    try {
      await axios.post(`${BASE_URL}/api/chat`, {
        message: 'Hello Bappa',
        conversationHistory: []
      });
      console.log('❌ Should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Auth check working - request properly rejected');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Test 3: Chat with invalid token (should fail)
    console.log('\n3️⃣ Testing Chat with Invalid Token...');
    try {
      await axios.post(`${BASE_URL}/api/chat`, {
        message: 'Hello Bappa',
        conversationHistory: []
      }, {
        headers: { 'Authorization': 'Bearer invalid-token' }
      });
      console.log('❌ Should have failed with invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid token properly rejected');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Test 4: Chat with valid JWT token (should succeed)
    console.log('\n4️⃣ Testing Chat with Valid JWT Token...');
    try {
      const validToken = generateTestToken(TEST_USER_ID);
      const chatResponse = await axios.post(`${BASE_URL}/api/chat`, {
        message: 'Hello Bappa, give me a blessing',
        conversationHistory: []
      }, {
        headers: { 'Authorization': `Bearer ${validToken}` }
      });
      
      if (chatResponse.status === 200) {
        console.log('✅ Chat with valid JWT successful!');
        console.log('📝 Response:', chatResponse.data.content.substring(0, 100) + '...');
      } else {
        console.log('❌ Unexpected response status:', chatResponse.status);
      }
    } catch (error) {
      if (error.response?.status === 429) {
        console.log('✅ Rate limiting working (daily limit reached)');
      } else {
        console.log('❌ Chat failed:', error.response?.data || error.message);
      }
    }

    // Test 5: Security - XSS attempt (should fail)
    console.log('\n5️⃣ Testing XSS Protection...');
    try {
      const validToken = generateTestToken(TEST_USER_ID);
      await axios.post(`${BASE_URL}/api/chat`, {
        message: '<script>alert("xss")</script>Hello Bappa',
        conversationHistory: []
      }, {
        headers: { 'Authorization': `Bearer ${validToken}` }
      });
      console.log('❌ Should have failed with XSS content');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.code === 'MALICIOUS_CONTENT') {
        console.log('✅ XSS protection working - malicious content rejected');
      } else {
        console.log('❌ XSS protection failed:', error.response?.data);
      }
    }

    console.log('\n🎉 Backend security tests completed!');
    console.log('📝 Next: Add your Groq API key to .env and test with real chat');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend is running: npm start');
    }
  }
}

testBackend();
