const { client } = require("../config/db");
require("dotenv").config();

async function addStaffTestAccounts() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");

    const db = client.db("quanlymuonsach1");

    // Thêm nhân viên test với mật khẩu plain text
    const testStaff = [
      {
        MSNV: "ADMIN001",
        HoTenNV: "Admin Demo",
        Password: "123456", // Plain text password
        ChucVu: "Admin",
        Role: "admin",
        NgaySinh: "1990-01-01",
        DiaChi: "123 Admin Street",
        Email: "admin001@demo.com",
        SoDienThoai: "0901234567",
      },
      {
        MSNV: "STAFF001",
        HoTenNV: "Staff Demo",
        Password: "password", // Plain text password
        ChucVu: "Thủ thư",
        Role: "librarian",
        NgaySinh: "1995-01-01",
        DiaChi: "456 Staff Avenue",
        Email: "staff001@demo.com",
        SoDienThoai: "0907654321",
      },
    ];

    console.log("🔍 Thêm nhân viên test với mật khẩu đơn giản...");

    for (const staff of testStaff) {
      const existing = await db
        .collection("nhanviens")
        .findOne({ MSNV: staff.MSNV });
      if (!existing) {
        await db.collection("nhanviens").insertOne(staff);
        console.log(`✅ Thêm: ${staff.MSNV} / ${staff.Password}`);
      } else {
        // Update password nếu đã tồn tại
        await db
          .collection("nhanviens")
          .updateOne(
            { MSNV: staff.MSNV },
            { $set: { Password: staff.Password } }
          );
        console.log(`🔄 Cập nhật: ${staff.MSNV} / ${staff.Password}`);
      }
    }

    console.log("\n📋 DANH SÁCH TÀI KHOẢN NHÂN VIÊN TEST:");
    console.log("====================================");
    console.log("ADMIN001 / 123456 (Admin)");
    console.log("STAFF001 / password (Thủ thư)");
    console.log("TEST_STAFF001 / admin123 (Admin)");

    console.log("\n🧪 Test đăng nhập với TaiKhoan = MSNV!");

    await client.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

addStaffTestAccounts();
