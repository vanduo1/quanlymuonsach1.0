const { client } = require("../config/db");
const bcrypt = require("bcryptjs");

const DB_NAME = "quanlymuonsach";

const defaultReaders = [
  {
    MaDocGia: "DG001",
    HoTen: "Nguyễn Văn A",
    DiaChi: "123 Đường ABC, Quận 1, TP.HCM",
    Email: "nguyenvana@gmail.com",
    SoDienThoai: "0901234567",
    MatKhau: "123456",
    NgayDangKy: new Date("2025-01-01"),
    TrangThai: "Hoạt động",
  },
  {
    MaDocGia: "DG002",
    HoTen: "Trần Thị B",
    DiaChi: "456 Đường XYZ, Quận 2, TP.HCM",
    Email: "tranthib@gmail.com",
    SoDienThoai: "0907654321",
    MatKhau: "123456",
    NgayDangKy: new Date("2025-01-02"),
    TrangThai: "Hoạt động",
  },
  {
    MaDocGia: "DG003",
    HoTen: "Lê Văn C",
    DiaChi: "789 Đường DEF, Quận 3, TP.HCM",
    Email: "levanc@gmail.com",
    SoDienThoai: "0909876543",
    MatKhau: "123456",
    NgayDangKy: new Date("2025-01-03"),
    TrangThai: "Hoạt động",
  },
];

async function resetReaders() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(DB_NAME);
    const docGiaCollection = db.collection("docgias");

    // Delete all existing readers
    await docGiaCollection.deleteMany({});
    console.log("Deleted all existing readers");

    // Hash passwords and insert new readers
    const readersWithHashedPasswords = await Promise.all(
      defaultReaders.map(async (reader) => {
        const hashedPassword = await bcrypt.hash(reader.MatKhau, 10);
        return { ...reader, MatKhau: hashedPassword };
      })
    );

    // Insert new readers
    await docGiaCollection.insertMany(readersWithHashedPasswords);
    console.log("Inserted default readers successfully");
  } catch (error) {
    console.error("Error resetting readers:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

// Run the reset function
resetReaders();
