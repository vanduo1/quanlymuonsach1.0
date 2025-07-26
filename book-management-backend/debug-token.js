const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Giả lập token từ frontend (bạn có thể paste token thực tế ở đây)
const sampleToken = ""; // Paste token từ localStorage của browser vào đây

// Hoặc tạo token mới cho DG001
const { MongoClient } = require('mongodb');

async function testToken() {
  if (sampleToken) {
    try {
      const decoded = jwt.verify(sampleToken, SECRET_KEY);
      console.log('✅ Token hợp lệ:');
      console.log(JSON.stringify(decoded, null, 2));
    } catch (error) {
      console.log('❌ Token không hợp lệ:', error.message);
    }
  } else {
    console.log('⚠️ Chưa có token để test');
  }
  
  // Tạo token mới cho DG001
  console.log('\n🔄 Tạo token mới cho DG001...');
  
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  try {
    await client.connect();
    const db = client.db('quanlymuonsach');
    const docGia = await db.collection('docgias').findOne({ MaDocGia: 'DG001' });
    
    if (docGia) {
      const newToken = jwt.sign(
        {
          id: docGia._id,
          role: 'reader',
          userId: docGia.MaDocGia,
          fullName: docGia.HoTen,
        },
        SECRET_KEY,
        { expiresIn: '24h' }
      );
      
      console.log('🎫 Token mới cho DG001:');
      console.log(newToken);
      console.log('\n📋 Decoded token:');
      console.log(JSON.stringify(jwt.decode(newToken), null, 2));
    } else {
      console.log('❌ Không tìm thấy DG001 trong database');
    }
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await client.close();
  }
}

testToken();
