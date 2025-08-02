const { client, connectDB, closeConnection } = require("../config/db");
const bcrypt = require("bcryptjs");

async function fixReaderAccounts() {
  try {
    console.log("🔌 Đang kết nối đến MongoDB...");
    await connectDB();

    const db = client.db("quanlymuonsach1");
    const docgiaCollection = db.collection("docgias");

    console.log("🔧 Bắt đầu sửa lỗi tài khoản độc giả...");

    // Hash mật khẩu mới
    const password = "123456";
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(
      `🔑 Mật khẩu mới: ${password} -> Hash: ${hashedPassword.substring(
        0,
        20
      )}...`
    );

    // Ngày hết hạn mới (1 năm từ bây giờ)
    const newExpireDate = new Date();
    newExpireDate.setFullYear(newExpireDate.getFullYear() + 1);
    console.log(
      `📅 Ngày hết hạn mới: ${newExpireDate.toISOString().split("T")[0]}`
    );

    // Cập nhật tất cả độc giả
    const updateResult = await docgiaCollection.updateMany(
      {}, // Cập nhật tất cả
      {
        $set: {
          MatKhau: hashedPassword,
          NgayHetHan: newExpireDate.toISOString().split("T")[0],
          TrangThai: "Hoạt động",
        },
      }
    );

    console.log(
      `✅ Đã cập nhật ${updateResult.modifiedCount} tài khoản độc giả`
    );

    // Kiểm tra lại dữ liệu sau khi cập nhật
    console.log("\n🔍 Kiểm tra lại dữ liệu sau khi cập nhật:");
    const readers = await docgiaCollection.find({}).toArray();

    for (const reader of readers) {
      console.log(`\n--- ${reader.MaDocGia} - ${reader.HoTen} ---`);
      console.log(`TrangThai: ${reader.TrangThai}`);
      console.log(`NgayHetHan: ${reader.NgayHetHan}`);

      // Test mật khẩu
      const isValid = await bcrypt.compare(password, reader.MatKhau);
      console.log(`Mật khẩu "${password}": ${isValid ? "✅ ĐÚNG" : "❌ SAI"}`);
    }

    console.log("\n🎉 Hoàn thành sửa lỗi tài khoản độc giả!");
    console.log("📋 Thông tin đăng nhập:");
    console.log("   - MaDocGia: DG001, Mật khẩu: 123456");
    console.log("   - MaDocGia: DG002, Mật khẩu: 123456");
  } catch (error) {
    console.error("❌ Lỗi khi sửa tài khoản:", error);
    process.exit(1);
  } finally {
    await closeConnection();
    console.log("\n🔌 Đã đóng kết nối MongoDB");
    process.exit(0);
  }
}

fixReaderAccounts();
