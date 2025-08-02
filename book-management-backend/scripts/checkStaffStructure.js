const { client } = require("../config/db");
require("dotenv").config();

async function checkStaffStructure() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");

    const db = client.db("quanlymuonsach1");
    const staff = await db.collection("nhanviens").find({}).toArray();

    console.log("\n👥 DANH SÁCH NHÂN VIÊN TRONG DATABASE:");
    console.log("=====================================");

    staff.forEach((s, index) => {
      console.log(`${index + 1}. MSNV: ${s.MSNV}`);
      console.log(`   HoTenNV: ${s.HoTenNV}`);
      console.log(`   ChucVu: ${s.ChucVu}`);
      console.log(`   Role: ${s.Role}`);
      console.log(
        `   Password: ${
          s.Password ? s.Password.substring(0, 20) + "..." : "NULL"
        }`
      );
      console.log(`   Email: ${s.Email}`);
      console.log("---");
    });

    console.log("\n🔍 KIỂM TRA TRƯỜNG ĐĂNG NHẬP:");
    console.log("===============================");
    const firstStaff = staff[0];
    if (firstStaff) {
      console.log("Fields available:", Object.keys(firstStaff));
      console.log(
        `TaiKhoan field exists: ${firstStaff.TaiKhoan ? "YES" : "NO"}`
      );
      console.log(`MSNV field exists: ${firstStaff.MSNV ? "YES" : "NO"}`);
      console.log(
        `Password field exists: ${firstStaff.Password ? "YES" : "NO"}`
      );
    }

    await client.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

checkStaffStructure();
