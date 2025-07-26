const { MongoClient } = require('mongodb');

async function checkReaders() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('quanlymuonsach');
    const readers = await db.collection('docgias').find({}).limit(5).toArray();
    
    console.log('\n📚 Danh sách độc giả:');
    readers.forEach(reader => {
      console.log(`- MaDocGia: ${reader.MaDocGia}`);
      console.log(`  _id: ${reader._id}`);
      console.log(`  HoTen: ${reader.HoTen}`);
      console.log(`  Email: ${reader.Email}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await client.close();
  }
}

checkReaders();
