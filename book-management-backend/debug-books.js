const { MongoClient } = require('mongodb');

async function checkBooks() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('quanlymuonsach');
    const books = await db.collection('sachs').find({}).limit(10).toArray();
    
    console.log('\n📚 Danh sách sách:');
    books.forEach(book => {
      console.log(`- ${book.MaSach}: ${book.TenSach} (Còn: ${book.SoLuongCon})`);
    });
    
    // Tìm sách có số lượng <= 0
    const zeroBooks = await db.collection('sachs').find({SoLuongCon: {$lte: 0}}).toArray();
    console.log('\n🚨 Sách hết hoặc số âm:');
    zeroBooks.forEach(book => {
      console.log(`- ${book.MaSach}: ${book.TenSach} (Còn: ${book.SoLuongCon})`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await client.close();
  }
}

checkBooks();
