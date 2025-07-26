const axios = require("axios");

async function testBorrowAPI() {
  try {
    // Thử đăng nhập trước
    console.log("🔐 Thử đăng nhập...");
    const loginResponse = await axios.post(
      "http://localhost:5000/api/login/reader",
      {
        MaDocGia: "TEST001",
        MatKhau: "password123",
      }
    );

    console.log("✅ Đăng nhập thành công:", loginResponse.data);
    const token = loginResponse.data.token;
    const userInfo = loginResponse.data.user;

    // Lấy danh sách sách có thể mượn
    console.log("\n📚 Lấy danh sách sách...");
    const booksResponse = await axios.get("http://localhost:5000/api/sach", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("📋 Response from /api/sach:", booksResponse.data);
    console.log(
      `📖 Tìm thấy ${booksResponse.data?.length || "undefined"} sách`
    );

    // Kiểm tra nếu data là object thì lấy array từ đó
    const books = booksResponse.data.sachs || [];
    console.log(`📚 Danh sách sách thực tế:`, books.length);

    const availableBook = books.find(
      (book) => (book.SoLuongCon || book.SoLuong) > 0
    );

    if (!availableBook) {
      console.log("❌ Không có sách nào có sẵn để mượn");
      return;
    }

    console.log(
      "📕 Sách có thể mượn:",
      availableBook.TenSach,
      "Còn:",
      availableBook.SoLuongCon || availableBook.SoLuong
    );

    // Thử mượn sách
    console.log("\n🔄 Thử mượn sách...");
    const borrowResponse = await axios.post(
      "http://localhost:5000/api/theodoimuonsach",
      {
        MaSach: availableBook.MaSach || availableBook._id,
        NgayHenTra: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("✅ Mượn sách thành công:", borrowResponse.data);
  } catch (error) {
    console.error("❌ Lỗi:", error.response?.data || error.message);
    console.error("Status:", error.response?.status);
    console.error("Headers:", error.response?.headers);
  }
}

testBorrowAPI();
