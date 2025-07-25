const { client } = require("../config/db");
require("dotenv").config();

async function showReaderCredentials() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");

    const db = client.db("quanlymuonsach");
    const readers = await db.collection("docgias").find({}).limit(5).toArray();

    console.log("\n🧑‍🎓 DANH SÁCH ĐỘC GIẢ VÀ MẬT KHẨU:");
    console.log("=====================================");

    readers.forEach((reader, index) => {
      console.log(`${index + 1}. MaDocGia: ${reader.MaDocGia}`);
      console.log(`   HoTen: ${reader.HoTen}`);
      console.log(`   MatKhau: ${reader.MatKhau}`);
      console.log(`   Email: ${reader.Email}`);
      console.log(`   TrangThai: ${reader.TrangThai || "Hoạt động"}`);
      console.log("---");
    });

    console.log("\n💡 Thông tin để test đăng nhập bình thường:");
    if (readers.length > 0) {
      console.log(`   MaDocGia: ${readers[0].MaDocGia}`);
      console.log(`   MatKhau: ${readers[0].MatKhau}`);
    }

    await client.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

showReaderCredentials();
