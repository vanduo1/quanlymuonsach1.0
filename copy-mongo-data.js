// Script chuyển toàn bộ dữ liệu từ database MongoDB cũ sang database mới
const { MongoClient } = require("mongodb");

const OLD_DB = "quanlymuonsach";
const NEW_DB = "quanlymuonsach1";
const MONGO_URI = "mongodb://127.0.0.1:27017";

async function copyCollections() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const oldDb = client.db(OLD_DB);
    const newDb = client.db(NEW_DB);
    const collections = await oldDb.listCollections().toArray();
    for (const col of collections) {
      const colName = col.name;
      const docs = await oldDb.collection(colName).find({}).toArray();
      if (docs.length > 0) {
        await newDb.collection(colName).insertMany(docs);
        console.log(
          `Đã copy ${docs.length} documents từ collection ${colName}`
        );
      } else {
        await newDb.createCollection(colName);
        console.log(`Tạo collection rỗng: ${colName}`);
      }
    }
    console.log("Hoàn tất chuyển dữ liệu!");
  } catch (err) {
    console.error("Lỗi:", err);
  } finally {
    await client.close();
  }
}

copyCollections();
