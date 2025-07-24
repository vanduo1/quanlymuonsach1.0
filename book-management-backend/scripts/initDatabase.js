const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quanlymuonsach";
const client = new MongoClient(uri);

// Dữ liệu mẫu cho sách
const sampleBooks = [
  {
    TenSach: "Dế Mèn Phiêu Lưu Ký",
    TacGia: "Tô Hoài",
    TheLoai: "Văn học thiếu nhi",
    NamXuatBan: 2020,
    MaNXB: "NXB001",
    SoLuong: 10,
    GiaSach: 75000,
    MoTa: "Tác phẩm văn học nổi tiếng kể về cuộc phiêu lưu của chú Dế Mèn",
    HinhAnh: "de-men-phieu-luu-ky.jpg",
  },
  {
    TenSach: "Số Đỏ",
    TacGia: "Vũ Trọng Phụng",
    TheLoai: "Văn học",
    NamXuatBan: 2019,
    MaNXB: "NXB002",
    SoLuong: 8,
    GiaSach: 85000,
    MoTa: "Tác phẩm văn học phê phán xã hội",
    HinhAnh: "so-do.jpg",
  },
  {
    TenSach: "Nhà Giả Kim",
    TacGia: "Paulo Coelho",
    TheLoai: "Văn học nước ngoài",
    NamXuatBan: 2020,
    MaNXB: "NXB003",
    SoLuong: 15,
    GiaSach: 90000,
    MoTa: "Cuốn sách về hành trình khám phá số phận của chính mình",
    HinhAnh: "nha-gia-kim.jpg",
  },
];

// Dữ liệu mẫu cho nhà xuất bản
const samplePublishers = [
  {
    MaNXB: "NXB001",
    TenNXB: "NXB Kim Đồng",
    DiaChi: "55 Quang Trung, Hai Bà Trưng, Hà Nội",
    Email: "info@nxbkimdong.com.vn",
    SoDienThoai: "02439434730",
  },
  {
    MaNXB: "NXB002",
    TenNXB: "NXB Trẻ",
    DiaChi: "161B Lý Chính Thắng, Phường 7, Quận 3, TP.HCM",
    Email: "info@nxbtre.com.vn",
    SoDienThoai: "02839317849",
  },
  {
    MaNXB: "NXB003",
    TenNXB: "NXB Văn Học",
    DiaChi: "18 Nguyễn Trường Tộ, Ba Đình, Hà Nội",
    Email: "info@nxbvanhoc.com.vn",
    SoDienThoai: "02437161512",
  },
];

// Dữ liệu mẫu cho độc giả
const sampleReaders = [
  {
    MaDocGia: "DG001",
    HoTen: "Nguyễn Văn An",
    NgaySinh: "1990-05-15",
    MatKhau: "$2b$10$6jUGfKqJeZ8MNobVbtgTW.f.UlsUr1O4iRF.sVh.iBzzYKX8AUFu2", // Mật khẩu: 123456
    DiaChi: "123 Nguyễn Huệ, Q1, TP.HCM",
    Email: "an.nguyen@email.com",
    SoDienThoai: "0901234567",
    NgayDangKy: "2023-01-01",
    NgayHetHan: "2024-01-01",
    TrangThai: "Hoạt động",
  },
  {
    MaDocGia: "DG002",
    HoTen: "Trần Thị Bình",
    NgaySinh: "1995-08-20",
    MatKhau: "$2b$10$6jUGfKqJeZ8MNobVbtgTW.f.UlsUr1O4iRF.sVh.iBzzYKX8AUFu2", // Mật khẩu: 123456
    DiaChi: "456 Lê Lợi, Q5, TP.HCM",
    Email: "binh.tran@email.com",
    SoDienThoai: "0912345678",
    NgayDangKy: "2023-02-01",
    NgayHetHan: "2024-02-01",
    TrangThai: "Hoạt động",
  },
];

// Dữ liệu mẫu cho nhân viên
const sampleStaff = [
  {
    MSNV: "AD0001",
    HoTenNV: "Phạm Thị Dung",
    ChucVu: "Quản lý",
    NgaySinh: "1985-07-25",
    DiaChi: "321 Võ Văn Tần, Q3, TP.HCM",
    Email: "dung.pham@thuvien.com",
    SoDienThoai: "0934567890",
    Password: "$2a$10$TmvyH1AoyDqRmQ4yjEoYoO.XbCfn4XRIqcQY1tKFOYu5m6rRZtYSO", // admin123
    Role: "admin",
  },
  {
    MSNV: "TT0001",
    HoTenNV: "Lê Văn Cường",
    ChucVu: "Thủ thư",
    NgaySinh: "1988-03-10",
    DiaChi: "789 Điện Biên Phủ, Q3, TP.HCM",
    Email: "cuong.le@thuvien.com",
    SoDienThoai: "0923456789",
    Password: "$2a$10$6jC89UdxAOzwPj0QqLJPk.AIcHJjDNL0qGEcX7UQpLeExA3pZnYbO", // thuthu123
    Role: "librarian",
  },
];

// Dữ liệu mẫu cho mượn sách
const sampleBorrows = [
  {
    MaMuon: "MS001",
    MaDocGia: "DG001",
    MaNhanVien: "NV001",
    MaSach: "6875d0d8dfba559d74b5c086", // ID của sách "Dế Mèn Phiêu Lưu Ký"
    NgayMuon: "2023-06-01",
    NgayHenTra: "2023-06-15",
    NgayTra: null,
    TrangThai: "Đang mượn",
    GhiChu: "Sách mới, tình trạng tốt",
  },
];

// Dữ liệu mẫu cho đặt sách
const sampleReservations = [
  {
    MaDatSach: "DS001",
    MaDocGia: "DG002",
    MaSach: "6875d0d8dfba559d74b5c086", // ID của sách "Dế Mèn Phiêu Lưu Ký"
    NgayDat: "2023-06-10",
    TrangThai: "Chờ xử lý",
    GhiChu: "Đặt trước 1 cuốn",
  },
];

async function initializeDatabase() {
  try {
    await client.connect();
    const db = client.db("quanlymuonsach");

    // Xóa collections cũ nếu tồn tại
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).drop();
    }

    console.log("Đã xóa collections cũ");

    // Tạo collections mới và thêm dữ liệu
    await db.collection("sachs").insertMany(sampleBooks);
    await db.collection("nhaxuatbans").insertMany(samplePublishers);
    await db.collection("docgias").insertMany(sampleReaders);
    await db.collection("nhanviens").insertMany(sampleStaff);
    await db.collection("muonsachs").insertMany(sampleBorrows);
    await db.collection("datsachs").insertMany(sampleReservations);

    // Tạo indexes
    await db.collection("sachs").createIndex({ TenSach: 1 });
    await db.collection("sachs").createIndex({ TheLoai: 1 });
    await db
      .collection("docgias")
      .createIndex({ MaDocGia: 1 }, { unique: true });
    await db.collection("nhanviens").createIndex({ MSNV: 1 }, { unique: true });
    await db
      .collection("nhanviens")
      .createIndex({ Email: 1 }, { unique: true });

    console.log("Đã khởi tạo cơ sở dữ liệu thành công với dữ liệu mẫu!");
  } catch (error) {
    console.error("Lỗi khi khởi tạo cơ sở dữ liệu:", error);
  } finally {
    await client.close();
  }
}

// Chạy script khởi tạo
initializeDatabase();
