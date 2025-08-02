const { client } = require("../config/db");
require("dotenv").config();

async function showFinalCredentials() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");

    const db = client.db("quanlymuonsach1");

    console.log("🎯 TỔNG KẾT TÀI KHOẢN DEMO NOSQL INJECTION");
    console.log("==========================================");

    console.log("\n👤 ĐỘC GIẢ (READERS):");
    console.log("--------------------");
    const readers = await db
      .collection("docgias")
      .find({
        MaDocGia: { $in: ["DG001", "DG999", "DEMO001", "TEST001"] },
      })
      .toArray();

    readers.forEach((reader) => {
      console.log(
        `✅ ${reader.MaDocGia} / ${reader.MatKhau} - ${reader.HoTen}`
      );
    });

    console.log("\n👥 NHÂN VIÊN (STAFF):");
    console.log("--------------------");
    const staff = await db
      .collection("nhanviens")
      .find({
        MSNV: { $in: ["AD0001", "TT0001", "TT0002"] },
      })
      .toArray();

    staff.forEach((s) => {
      console.log(`✅ ${s.MSNV} / ${s.Password} - ${s.HoTenNV} (${s.ChucVu})`);
    });

    console.log("\n💥 NOSQL INJECTION PAYLOADS:");
    console.log("-----------------------------");
    console.log('✅ {"$ne": null}       - Bypass authentication');
    console.log('✅ {"$exists": true}   - Find any existing user');
    console.log('✅ {"$regex": ".*"}    - Match everything');
    console.log('✅ {"$gt": ""}         - Greater than empty string');

    console.log("\n🎪 DEMO INSTRUCTIONS:");
    console.log("=====================");
    console.log("1. 🌐 Mở: http://localhost:8080/nosql-injection-demo.html");
    console.log("2. 🔓 Test đăng nhập bình thường với credentials trên");
    console.log("3. 💥 Test NoSQL injection với payloads trên");
    console.log("4. 🔍 So sánh kết quả - Cả hai đều thành công!");

    console.log("\n✅ HỆ THỐNG SẴN SÀNG CHO DEMO!");

    await client.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

showFinalCredentials();
