const axios = require("axios");

async function testAllBorrowScenarios() {
  try {
    // Đăng nhập
    console.log("🔐 Đăng nhập với tài khoản TEST001...");
    const loginResponse = await axios.post(
      "http://localhost:5000/api/login/reader",
      {
        MaDocGia: "TEST001",
        MatKhau: "password123",
      }
    );

    const token = loginResponse.data.token;
    console.log("✅ Đăng nhập thành công!");

    // Lấy danh sách sách
    console.log("\n📚 Lấy danh sách tất cả sách...");
    const booksResponse = await axios.get(
      "http://localhost:5000/api/sach?limit=50",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const books = booksResponse.data.sachs || [];
    console.log(`📖 Tổng số sách: ${books.length}`);

    // Phân loại sách theo số lượng
    const availableBooks = books.filter((book) => book.SoLuongCon > 10);
    const limitedBooks = books.filter(
      (book) => book.SoLuongCon >= 1 && book.SoLuongCon <= 10
    );
    const outOfStockBooks = books.filter((book) => book.SoLuongCon === 0);

    console.log("\n📊 THỐNG KÊ SÁCH THEO SỐ LƯỢNG:");
    console.log(`🟢 Sách có nhiều (>10 cuốn): ${availableBooks.length}`);
    console.log(`🟡 Sách có ít (1-10 cuốn): ${limitedBooks.length}`);
    console.log(`🔴 Sách hết (0 cuốn): ${outOfStockBooks.length}`);

    // Test mượn sách có nhiều
    if (availableBooks.length > 0) {
      console.log("\n🟢 TEST MƯỢN SÁCH CÓ NHIỀU:");
      const book = availableBooks[0];
      console.log(`   📗 Sách: ${book.TenSach} (Còn: ${book.SoLuongCon} cuốn)`);

      try {
        const borrowResponse = await axios.post(
          "http://localhost:5000/api/theodoimuonsach",
          {
            MaSach: book.MaSach,
            NgayHenTra: new Date(
              Date.now() + 14 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log(`   ✅ Mượn thành công: ${borrowResponse.data.message}`);
        console.log(`   📝 Mã mượn: ${borrowResponse.data.MaMuon}`);
      } catch (error) {
        console.log(
          `   ❌ Lỗi: ${error.response?.data?.message || error.message}`
        );
      }
    }

    // Test mượn sách có ít
    if (limitedBooks.length > 0) {
      console.log("\n🟡 TEST MƯỢN SÁCH CÓ ÍT:");
      const book = limitedBooks[0];
      console.log(`   📙 Sách: ${book.TenSach} (Còn: ${book.SoLuongCon} cuốn)`);

      try {
        const borrowResponse = await axios.post(
          "http://localhost:5000/api/theodoimuonsach",
          {
            MaSach: book.MaSach,
            NgayHenTra: new Date(
              Date.now() + 14 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log(`   ✅ Mượn thành công: ${borrowResponse.data.message}`);
        console.log(`   📝 Mã mượn: ${borrowResponse.data.MaMuon}`);
      } catch (error) {
        console.log(
          `   ❌ Lỗi: ${error.response?.data?.message || error.message}`
        );
      }
    }

    // Test mượn sách hết
    if (outOfStockBooks.length > 0) {
      console.log("\n🔴 TEST MƯỢN SÁCH HẾT:");
      const book = outOfStockBooks[0];
      console.log(`   📕 Sách: ${book.TenSach} (Còn: ${book.SoLuongCon} cuốn)`);

      try {
        const borrowResponse = await axios.post(
          "http://localhost:5000/api/theodoimuonsach",
          {
            MaSach: book.MaSach,
            NgayHenTra: new Date(
              Date.now() + 14 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log(`   ✅ Mượn thành công: ${borrowResponse.data.message}`);
        console.log(`   📝 Mã mượn: ${borrowResponse.data.MaMuon}`);
      } catch (error) {
        console.log(
          `   ❌ Lỗi: ${error.response?.data?.message || error.message}`
        );
      }
    }

    // Hiển thị chi tiết từng loại sách
    console.log("\n📋 CHI TIẾT CÁC LOẠI SÁCH:");

    console.log("\n🟢 SÁCH CÓ NHIỀU:");
    availableBooks.forEach((book, index) => {
      console.log(
        `   ${index + 1}. ${book.TenSach} - ${book.TacGia} (${
          book.SoLuongCon
        }/${book.SoLuong} cuốn)`
      );
    });

    console.log("\n🟡 SÁCH CÓ ÍT:");
    limitedBooks.forEach((book, index) => {
      console.log(
        `   ${index + 1}. ${book.TenSach} - ${book.TacGia} (${
          book.SoLuongCon
        }/${book.SoLuong} cuốn)`
      );
    });

    console.log("\n🔴 SÁCH HẾT:");
    outOfStockBooks.forEach((book, index) => {
      console.log(
        `   ${index + 1}. ${book.TenSach} - ${book.TacGia} (${
          book.SoLuongCon
        }/${book.SoLuong} cuốn)`
      );
    });

    // Test đặt chỗ sách hết
    if (outOfStockBooks.length > 0) {
      console.log("\n📝 TEST ĐẶT CHỖ SÁCH HẾT:");
      const book = outOfStockBooks[0];
      console.log(`   📕 Sách: ${book.TenSach}`);

      try {
        const reserveResponse = await axios.post(
          "http://localhost:5000/api/datsach",
          {
            MaSach: book.MaSach,
            SoLuong: 1,
            TrangThai: "dat_cho",
            GhiChu: "Đặt chỗ trước",
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log(
          `   ✅ Đặt chỗ thành công: ${reserveResponse.data.message}`
        );
      } catch (error) {
        console.log(
          `   ❌ Lỗi đặt chỗ: ${error.response?.data?.message || error.message}`
        );
      }
    }
  } catch (error) {
    console.error("❌ Lỗi:", error.response?.data || error.message);
  }
}

testAllBorrowScenarios();
