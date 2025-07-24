const { client, connectDB } = require("../config/db");

async function checkDatabase() {
  try {
    await connectDB();
    const db = client.db("quanlymuonsach");

    console.log("📋 Kiểm tra collections trong database...\n");

    // Kiểm tra collection nhân viên
    const nhanvienCollection = db.collection("nhanviens");
    const nhanviens = await nhanvienCollection.find({}).limit(5).toArray();
    console.log(
      "👥 Nhân viên:",
      nhanviens.map((nv) => ({
        TaiKhoan: nv.TaiKhoan,
        ChucVu: nv.ChucVu,
        TrangThai: nv.TrangThai,
      }))
    );

    // Kiểm tra collection sách
    const sachCollection = db.collection("sachs");
    const sachCount = await sachCollection.countDocuments();
    console.log(`\n📚 Số lượng sách: ${sachCount}`);

    if (sachCount > 0) {
      const sampleBooks = await sachCollection.find({}).limit(3).toArray();
      console.log(
        "📖 Sách mẫu:",
        sampleBooks.map((s) => ({
          MaSach: s.MaSach,
          TenSach: s.TenSach,
          SoLuong: s.SoLuong,
        }))
      );
    }

    // Kiểm tra collection độc giả
    const docgiaCollection = db.collection("docgias");
    const docgiaCount = await docgiaCollection.countDocuments();
    console.log(`\n👤 Số lượng độc giả: ${docgiaCount}`);
  } catch (error) {
    console.error("❌ Lỗi kết nối database:", error);
  } finally {
    process.exit(0);
  }
}

checkDatabase();
