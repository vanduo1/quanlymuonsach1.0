const { client } = require("../config/db");
require("dotenv").config();

async function addTestAccounts() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");

    const db = client.db("quanlymuonsach");

    // Thêm độc giả test với password plain text (cho demo vulnerable)
    const testReaders = [
      {
        MaDocGia: "TEST001",
        HoTen: "Nguyễn Test User",
        MatKhau: "password123", // Plain text password cho demo
        Email: "test@demo.com",
        NgaySinh: "1995-01-01",
        DiaChi: "123 Test Street",
        SoDienThoai: "0901234567",
        TrangThai: "Hoạt động",
        NgayDangKy: new Date(),
        NgayHetHan: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    ];

    // Thêm nhân viên test với password plain text
    const testStaff = [
      {
        MSNV: "TEST_STAFF001",
        HoTenNV: "Admin Test User",
        Password: "admin123", // Plain text password cho demo
        ChucVu: "Admin",
        Role: "admin",
        NgaySinh: "1990-01-01",
        DiaChi: "456 Admin Street",
        Email: "admin@demo.com",
        SoDienThoai: "0907654321",
      },
    ];

    // Kiểm tra và thêm độc giả test
    for (const reader of testReaders) {
      const existing = await db
        .collection("docgias")
        .findOne({ MaDocGia: reader.MaDocGia });
      if (!existing) {
        await db.collection("docgias").insertOne(reader);
        console.log(
          `✅ Thêm độc giả test: ${reader.MaDocGia} / ${reader.MatKhau}`
        );
      } else {
        console.log(`⚠️  Độc giả test đã tồn tại: ${reader.MaDocGia}`);
      }
    }

    // Kiểm tra và thêm nhân viên test
    for (const staff of testStaff) {
      const existing = await db
        .collection("nhanviens")
        .findOne({ MSNV: staff.MSNV });
      if (!existing) {
        await db.collection("nhanviens").insertOne(staff);
        console.log(
          `✅ Thêm nhân viên test: ${staff.MSNV} / ${staff.Password}`
        );
      } else {
        console.log(`⚠️  Nhân viên test đã tồn tại: ${staff.MSNV}`);
      }
    }

    console.log("\n🎯 THÔNG TIN ĐĂNG NHẬP BÌNH THƯỜNG:");
    console.log("=====================================");
    console.log("ĐỘC GIẢ:");
    console.log("  MaDocGia: TEST001");
    console.log("  MatKhau: password123");
    console.log("\nNHÂN VIÊN:");
    console.log("  TaiKhoan: TEST_STAFF001");
    console.log("  MatKhau: admin123");

    console.log("\n💥 PAYLOAD NOSQL INJECTION:");
    console.log("===============================");
    console.log('  {"$ne": null}');
    console.log('  {"$exists": true}');
    console.log('  {"$regex": ".*"}');

    await client.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

addTestAccounts();
