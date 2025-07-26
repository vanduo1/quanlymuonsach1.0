const { MongoClient } = require('mongodb');

async function checkReader() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('quanlymuonsach');
    
    // Kiểm tra collection docgias
    const readers = await db.collection('docgias').find({}).limit(5).toArray();
    console.log('\n👤 Danh sách độc giả:');
    readers.forEach(reader => {
      console.log(`- MaDocGia: ${reader.MaDocGia}`);
      console.log(`  Họ tên: ${reader.HoTen}`);
      console.log(`  Username: ${reader.username || 'N/A'}`);
      console.log(`  _id: ${reader._id}`);
      console.log('---');
    });
    
    // Tìm độc giả DG001
    const reader001 = await db.collection('docgias').findOne({MaDocGia: 'DG001'});
    console.log('\n🔍 Tìm độc giả DG001:');
    if (reader001) {
      console.log('✅ Tìm thấy:', JSON.stringify(reader001, null, 2));
    } else {
      console.log('❌ Không tìm thấy DG001');
    }
    
    // Tìm bằng username
    const readerByUsername = await db.collection('docgias').findOne({username: 'DG001'});
    console.log('\n🔍 Tìm theo username DG001:');
    if (readerByUsername) {
      console.log('✅ Tìm thấy:', JSON.stringify(readerByUsername, null, 2));
    } else {
      console.log('❌ Không tìm thấy username DG001');
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await client.close();
  }
}

checkReader();
