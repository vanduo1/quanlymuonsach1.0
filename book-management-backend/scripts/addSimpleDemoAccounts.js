const { client } = require("../config/db");
require("dotenv").config();

async function addSimpleDemoAccounts() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");

    const db = client.db("quanlymuonsach1");

    // Thêm tài khoản với mật khẩu đơn giản cho demo
    const demoAccounts = [
      {
        MaDocGia: "DG999",
        HoTen: "Demo User Simple",
        MatKhau: "123456", // Plain text password
        Email: "demo999@test.com",
        NgaySinh: "1990-01-01",
        DiaChi: "123 Demo Street",
        SoDienThoai: "0901234567",
        TrangThai: "Hoạt động",
        NgayDangKy: new Date(),
        NgayHetHan: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        MaDocGia: "DEMO001",
        HoTen: "Test Demo User",
        MatKhau: "password", // Plain text password
        Email: "demo001@test.com",
        NgaySinh: "1995-01-01",
        DiaChi: "456 Test Avenue",
        SoDienThoai: "0907654321",
        TrangThai: "Hoạt động",
        NgayDangKy: new Date(),
        NgayHetHan: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    ];

    console.log("🔍 Thêm tài khoản demo với mật khẩu đơn giản...");

    for (const account of demoAccounts) {
      const existing = await db
        .collection("docgias")
        .findOne({ MaDocGia: account.MaDocGia });
      if (!existing) {
        await db.collection("docgias").insertOne(account);
        console.log(`✅ Thêm: ${account.MaDocGia} / ${account.MatKhau}`);
      } else {
        // Update password nếu đã tồn tại
        await db
          .collection("docgias")
          .updateOne(
            { MaDocGia: account.MaDocGia },
            { $set: { MatKhau: account.MatKhau } }
          );
        console.log(`🔄 Cập nhật: ${account.MaDocGia} / ${account.MatKhau}`);
      }
    }

    // Cập nhật cả user DG001 để có mật khẩu đơn giản
    await db
      .collection("docgias")
      .updateOne({ MaDocGia: "DG001" }, { $set: { MatKhau: "123456" } });
    console.log("🔄 Cập nhật DG001 / 123456");

    console.log("\n📋 DANH SÁCH TÀI KHOẢN DEMO:");
    console.log("==============================");
    console.log("DG001 / 123456");
    console.log("DG999 / 123456");
    console.log("DEMO001 / password");
    console.log("TEST001 / password123");

    console.log("\n🧪 Test đăng nhập với các tài khoản trên!");

    await client.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

addSimpleDemoAccounts();
