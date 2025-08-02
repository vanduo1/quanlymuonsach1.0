const { client, connectDB, closeConnection } = require("../config/db");

async function checkReaderData() {
  try {
    console.log("🔌 Đang kết nối đến MongoDB...");
    await connectDB();

    const db = client.db("quanlymuonsach1");
    const docgiaCollection = db.collection("docgias");

    console.log("👥 Kiểm tra dữ liệu độc giả...");

    const readers = await docgiaCollection.find({}).toArray();

    if (readers.length === 0) {
      console.log("❌ Không có độc giả nào trong database!");
    } else {
      console.log(`📊 Tìm thấy ${readers.length} độc giả:`);
      readers.forEach((reader, index) => {
        console.log(`\n--- Độc giả ${index + 1} ---`);
        console.log(`MaDocGia: ${reader.MaDocGia}`);
        console.log(`HoTen: ${reader.HoTen}`);
        console.log(`Email: ${reader.Email}`);
        console.log(`TrangThai: ${reader.TrangThai}`);
        console.log(
          `MatKhau: ${
            reader.MatKhau ? "✅ Có mật khẩu" : "❌ KHÔNG CÓ MẬT KHẨU"
          }`
        );
        console.log(`NgayDangKy: ${reader.NgayDangKy}`);
        console.log(`NgayHetHan: ${reader.NgayHetHan}`);
      });
    }

    // Kiểm tra cả collection nhanviens để so sánh
    const nhanvienCollection = db.collection("nhanviens");
    const staff = await nhanvienCollection.find({}).toArray();
    console.log(`\n👨‍💼 Số lượng nhân viên: ${staff.length}`);
  } catch (error) {
    console.error("❌ Lỗi khi kiểm tra dữ liệu:", error);
  } finally {
    await closeConnection();
    console.log("\n🔌 Đã đóng kết nối MongoDB");
    process.exit(0);
  }
}

checkReaderData();
