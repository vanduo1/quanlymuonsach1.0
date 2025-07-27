const { client } = require("../config/db");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function updateStaffPasswords() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");

    const db = client.db("quanlymuonsach");

    // Cập nhật mật khẩu cho các nhân viên có sẵn
    const staffUpdates = [
      { MSNV: "AD0001", newPassword: "admin123" },
      { MSNV: "TT0001", newPassword: "thuthu123" },
      { MSNV: "TT0002", newPassword: "thuthu123" },
    ];

    console.log("🔄 Cập nhật mật khẩu nhân viên...");

    for (const update of staffUpdates) {
      // Mã hóa mật khẩu bằng bcrypt
      const hashedPassword = await bcrypt.hash(update.newPassword, 10);
      const result = await db
        .collection("nhanviens")
        .updateOne(
          { MSNV: update.MSNV },
          { $set: { Password: hashedPassword } }
        );

      if (result.matchedCount > 0) {
        console.log(`✅ Cập nhật ${update.MSNV} / ${update.newPassword}`);
      } else {
        console.log(`❌ Không tìm thấy ${update.MSNV}`);
      }
    }

    // Kiểm tra kết quả
    console.log("\n📋 THÔNG TIN ĐĂNG NHẬP NHÂN VIÊN:");
    console.log("=================================");

    for (const update of staffUpdates) {
      const staff = await db
        .collection("nhanviens")
        .findOne({ MSNV: update.MSNV });
      if (staff) {
        console.log(
          `${staff.MSNV} / ${staff.Password} - ${staff.HoTenNV} (${staff.ChucVu})`
        );
      }
    }

    console.log("\n🧪 Bây giờ có thể đăng nhập với các tài khoản trên!");

    await client.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

updateStaffPasswords();
