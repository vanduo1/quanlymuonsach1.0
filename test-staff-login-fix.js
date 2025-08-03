const axios = require('axios');

async function testStaffLogin() {
  try {
    console.log('🧪 TESTING STAFF LOGIN AFTER FIX...');
    console.log('=====================================');
    
    // Test với thông tin nhân viên admin
    const staffData = {
      MSNV: 'AD0001',
      MatKhau: 'admin123'
    };
    
    console.log('Testing with staff account:', staffData.MSNV);
    
    const response = await axios.post('http://localhost:3000/api/login/staff', staffData);
    
    console.log('✅ Login successful!');
    console.log('Response data:', {
      message: response.data.message,
      user: response.data.user,
      token: response.data.token ? 'Token received' : 'No token'
    });
    
  } catch (error) {
    console.log('❌ Login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error message:', error.response.data.message);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Chạy test
testStaffLogin();
