const { client, connectDB, closeConnection } = require("../config/db");
const bcrypt = require("bcryptjs");

async function testReaderLogin() {
  try {
    console.log("🔌 Đang kết nối đến MongoDB...");
    await connectDB();

    const db = client.db("quanlymuonsach1");
    const docgiaCollection = db.collection("docgias");

    // Test với thông tin đăng nhập
    const testCredentials = [
      { MaDocGia: "DG001", MatKhau: "123456" },
      { MaDocGia: "DG002", MatKhau: "123456" },
    ];

    for (const cred of testCredentials) {
      console.log(`\n🔍 Test đăng nhập cho ${cred.MaDocGia}...`);

      // Tìm độc giả
      const docGia = await docgiaCollection.findOne({
        MaDocGia: cred.MaDocGia,
      });

      if (!docGia) {
        console.log(`❌ Không tìm thấy độc giả ${cred.MaDocGia}`);
        continue;
      }

      console.log(`✅ Tìm thấy độc giả: ${docGia.HoTen}`);
      console.log(`📧 Email: ${docGia.Email}`);
      console.log(`🔒 Trạng thái: ${docGia.TrangThai}`);
      console.log(`🗓️  Ngày hết hạn: ${docGia.NgayHetHan}`);

      // Kiểm tra mật khẩu
      if (!docGia.MatKhau) {
        console.log(`❌ Độc giả ${cred.MaDocGia} không có mật khẩu`);
        continue;
      }

      console.log(`🔑 Hash mật khẩu: ${docGia.MatKhau.substring(0, 20)}...`);

      // Test bcrypt compare
      const isPasswordValid = await bcrypt.compare(
        cred.MatKhau,
        docGia.MatKhau
      );
      console.log(
        `🔓 Kiểm tra mật khẩu "${cred.MatKhau}": ${
          isPasswordValid ? "✅ ĐÚNG" : "❌ SAI"
        }`
      );

      // Kiểm tra trạng thái tài khoản
      if (docGia.TrangThai !== "Hoạt động") {
        console.log(`⚠️  Tài khoản không hoạt động: ${docGia.TrangThai}`);
      }

      // Kiểm tra ngày hết hạn
      const today = new Date();
      let expireDate;
      if (typeof docGia.NgayHetHan === "string") {
        expireDate = new Date(docGia.NgayHetHan);
      } else {
        expireDate = docGia.NgayHetHan;
      }

      if (expireDate && expireDate < today) {
        console.log(
          `⚠️  Tài khoản đã hết hạn: ${expireDate.toISOString().split("T")[0]}`
        );
      }

      console.log(
        `📋 Kết luận: ${
          isPasswordValid && docGia.TrangThai === "Hoạt động"
            ? "✅ Có thể đăng nhập"
            : "❌ Không thể đăng nhập"
        }`
      );
    }
  } catch (error) {
    console.error("❌ Lỗi khi test đăng nhập:", error);
  } finally {
    await closeConnection();
    console.log("\n🔌 Đã đóng kết nối MongoDB");
    process.exit(0);
  }
}

testReaderLogin();
