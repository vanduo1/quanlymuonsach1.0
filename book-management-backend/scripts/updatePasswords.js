const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quanlymuonsach";
const client = new MongoClient(uri);

async function updateStaffPasswords() {
  try {
    await client.connect();
    const db = client.db("quanlymuonsach");
    const nhanVienCollection = db.collection("nhanviens");

    // Update admin password
    await nhanVienCollection.updateOne(
      { MSNV: "AD0001" },
      { $set: { Password: await bcrypt.hash("admin123", 10) } }
    );

    // Update librarian password
    await nhanVienCollection.updateOne(
      { MSNV: "TT0001" },
      { $set: { Password: await bcrypt.hash("thuthu123", 10) } }
    );

    console.log("Đã cập nhật mật khẩu thành công!");
  } catch (error) {
    console.error("Lỗi khi cập nhật mật khẩu:", error);
  } finally {
    await client.close();
  }
}

updateStaffPasswords();
