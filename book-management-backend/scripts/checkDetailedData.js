const { client, connectDB } = require("../config/db");

async function checkDetailedData() {
  try {
    await connectDB();
    const db = client.db("quanlymuonsach1");

    console.log("🔍 Kiểm tra cấu trúc dữ liệu chi tiết...\n");

    // Kiểm tra nhân viên chi tiết
    const nhanvienCollection = db.collection("nhanviens");
    const nhanviens = await nhanvienCollection.find({}).limit(2).toArray();
    console.log("👥 Nhân viên chi tiết:");
    nhanviens.forEach((nv, index) => {
      console.log(`  ${index + 1}:`, JSON.stringify(nv, null, 2));
    });

    // Kiểm tra sách chi tiết
    const sachCollection = db.collection("sachs");
    const sachs = await sachCollection.find({}).limit(1).toArray();
    console.log("\n📚 Sách chi tiết:");
    sachs.forEach((s, index) => {
      console.log(`  ${index + 1}:`, JSON.stringify(s, null, 2));
    });

    // Kiểm tra tất cả collections
    const collections = await db.listCollections().toArray();
    console.log("\n📋 Tất cả collections:");
    collections.forEach((col) => {
      console.log(`  - ${col.name}`);
    });
  } catch (error) {
    console.error("❌ Lỗi:", error);
  } finally {
    process.exit(0);
  }
}

checkDetailedData();
