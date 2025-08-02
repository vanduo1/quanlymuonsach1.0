const { client, connectDB, closeConnection } = require("../config/db");

// Dữ liệu mẫu cho mượn sách
const sampleBorrows = [
  {
    MaMuon: "MS001",
    MaDocGia: "DG001",
    MaNhanVien: "AD0001",
    MaSach: "Dế Mèn Phiêu Lưu Ký", // Tên sách thay vì ID
    NgayMuon: new Date("2023-06-01"),
    NgayHenTra: new Date("2023-06-15"),
    NgayTra: null,
    TrangThai: "Đang mượn",
    GhiChu: "Sách mới, tình trạng tốt",
  },
  {
    MaMuon: "MS002",
    MaDocGia: "DG002",
    MaNhanVien: "TT0001",
    MaSach: "Số Đỏ",
    NgayMuon: new Date("2023-06-05"),
    NgayHenTra: new Date("2023-06-19"),
    NgayTra: new Date("2023-06-18"),
    TrangThai: "Đã trả",
    GhiChu: "Trả đúng hạn",
  },
  {
    MaMuon: "MS003",
    MaDocGia: "DG001",
    MaNhanVien: "AD0001",
    MaSach: "Nhà Giả Kim",
    NgayMuon: new Date("2023-06-10"),
    NgayHenTra: new Date("2023-06-24"),
    NgayTra: null,
    TrangThai: "Đang mượn",
    GhiChu: "Gia hạn thêm 7 ngày",
  },
];

// Dữ liệu mẫu cho đặt sách
const sampleReservations = [
  {
    MaDatSach: "DS001",
    MaDocGia: "DG002",
    MaSach: "Dế Mèn Phiêu Lưu Ký",
    NgayDat: new Date("2023-06-10"),
    NgayHetHan: new Date("2023-06-17"),
    TrangThai: "Chờ xử lý",
    GhiChu: "Đặt trước 1 cuốn",
  },
  {
    MaDatSach: "DS002",
    MaDocGia: "DG001",
    MaSach: "Số Đỏ",
    NgayDat: new Date("2023-06-12"),
    NgayHetHan: new Date("2023-06-19"),
    TrangThai: "Đã xử lý",
    GhiChu: "Đã chuyển thành phiếu mượn",
  },
  {
    MaDatSach: "DS003",
    MaDocGia: "DG002",
    MaSach: "Nhà Giả Kim",
    NgayDat: new Date("2023-06-15"),
    NgayHetHan: new Date("2023-06-22"),
    TrangThai: "Hết hạn",
    GhiChu: "Quá hạn, tự động hủy",
  },
];

async function restoreBorrowReservationData() {
  try {
    console.log("🔌 Đang kết nối đến MongoDB...");
    await connectDB();

    const db = client.db("quanlymuonsach1");

    // Khôi phục dữ liệu mượn sách
    console.log("📚 Đang khôi phục dữ liệu mượn sách...");

    // Xóa dữ liệu cũ trước khi thêm mới
    await db.collection("theodoimuonsachs").deleteMany({});

    // Thêm dữ liệu mẫu mượn sách
    const borrowResult = await db
      .collection("theodoimuonsachs")
      .insertMany(sampleBorrows);
    console.log(
      `✅ Đã khôi phục ${borrowResult.insertedCount} phiếu mượn sách`
    );

    // Khôi phục dữ liệu đặt sách
    console.log("📝 Đang khôi phục dữ liệu đặt sách...");

    // Xóa dữ liệu cũ trước khi thêm mới
    await db.collection("datsachs").deleteMany({});

    // Thêm dữ liệu mẫu đặt sách
    const reservationResult = await db
      .collection("datsachs")
      .insertMany(sampleReservations);
    console.log(
      `✅ Đã khôi phục ${reservationResult.insertedCount} phiếu đặt sách`
    );

    console.log("\n📊 Tóm tắt khôi phục:");
    console.log(`- Phiếu mượn sách: ${borrowResult.insertedCount} bản ghi`);
    console.log(`- Phiếu đặt sách: ${reservationResult.insertedCount} bản ghi`);
    console.log(
      "📝 Lưu ý: Chỉ khôi phục dữ liệu mượn và đặt sách, không ảnh hưởng dữ liệu khác"
    );
    console.log("🎉 Hoàn thành việc khôi phục dữ liệu!");
  } catch (error) {
    console.error("❌ Lỗi khi khôi phục dữ liệu:", error);
    process.exit(1);
  } finally {
    await closeConnection();
    console.log("🔌 Đã đóng kết nối MongoDB");
    process.exit(0);
  }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  restoreBorrowReservationData();
}

module.exports = { restoreBorrowReservationData };
