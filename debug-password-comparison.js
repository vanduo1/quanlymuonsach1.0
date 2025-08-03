const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

async function debugPasswordComparison() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  await client.connect();
  const db = client.db('quanlymuonsach1');
  const nhanVienCollection = db.collection('nhanviens');
  
  console.log('🔍 DEBUG PASSWORD COMPARISON');
  console.log('==============================');
  
  // Get the admin staff member
  const admin = await nhanVienCollection.findOne({ MSNV: 'AD0001' });
  
  if (admin) {
    console.log('✅ Admin found:', admin.MSNV, '-', admin.HoTenNV);
    console.log('📝 Stored hash:', admin.Password);
    
    // Test various password attempts
    const passwordsToTest = ['admin123', 'Admin123', 'ADMIN123', 'admin', '123456'];
    
    for (const testPassword of passwordsToTest) {
      console.log(`\n🧪 Testing password: "${testPassword}"`);
      
      try {
        const isValid = await bcrypt.compare(testPassword, admin.Password);
        console.log(`Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
        
        if (isValid) {
          console.log(`🎉 CORRECT PASSWORD FOUND: "${testPassword}"`);
          break;
        }
      } catch (error) {
        console.log(`Error testing password: ${error.message}`);
      }
    }
    
    // Also test hash generation
    console.log('\n🔧 HASH VERIFICATION:');
    const newHash = await bcrypt.hash('admin123', 10);
    console.log('New hash for "admin123":', newHash);
    console.log('Compare with new hash:', await bcrypt.compare('admin123', newHash));
    
  } else {
    console.log('❌ Admin user not found');
  }
  
  await client.close();
}

debugPasswordComparison().catch(console.error);
