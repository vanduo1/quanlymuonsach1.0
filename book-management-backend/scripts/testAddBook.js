const axios = require("axios");

// Cấu hình axios
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

async function testAddBook() {
  try {
    console.log("🔐 Đăng nhập với tài khoản thủ thư...");

    // Đăng nhập với tài khoản thủ thư
    const loginResponse = await api.post("/login/staff", {
      TaiKhoan: "TT0001",
      MatKhau: "thuthu123",
    });

    console.log("✅ Đăng nhập thành công:", loginResponse.data.message);

    const token = loginResponse.data.token;

    // Thiết lập token cho các request tiếp theo
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    console.log("\n📚 Thêm sách mới...");

    // Dữ liệu sách để test
    const bookData = {
      TenSach: "Sách Test Thêm Mới",
      TacGia: "Tác Giả Test",
      TheLoai: "Khoa học viễn tưởng",
      NamXuatBan: 2024,
      NhaXuatBan: "NXB Test",
      MaNXB: "NXB001",
      SoLuong: 10,
      GiaSach: 150000,
      MoTa: "Đây là sách test để kiểm tra chức năng thêm mới",
      ISBN: "978-0-123456-78-9",
      HinhAnh: "https://example.com/book-cover.jpg",
    };

    console.log("📝 Dữ liệu sách:", JSON.stringify(bookData, null, 2));

    const addBookResponse = await api.post("/sach", bookData);

    console.log("✅ Thêm sách thành công:", addBookResponse.data);

    console.log("\n📖 Lấy danh sách sách để kiểm tra...");

    const booksResponse = await api.get("/sach");
    const newBook = booksResponse.data.sachs.find(
      (book) => book.TenSach === bookData.TenSach
    );

    if (newBook) {
      console.log("✅ Tìm thấy sách vừa thêm:", {
        MaSach: newBook.MaSach,
        TenSach: newBook.TenSach,
        TacGia: newBook.TacGia,
        SoLuong: newBook.SoLuong,
        GiaSach: newBook.GiaSach,
      });
    } else {
      console.log("❌ Không tìm thấy sách vừa thêm trong danh sách");
    }
  } catch (error) {
    console.error("❌ Lỗi test:", error.response?.data || error.message);
  }
}

// Chạy test
testAddBook();
