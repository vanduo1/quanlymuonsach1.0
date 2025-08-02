const axios = require("axios");

async function testLoginAPI() {
  try {
    const baseURL = "http://localhost:3000"; // Hoặc cổng server của bạn

    console.log("🔍 Test API đăng nhập độc giả...");

    const testCases = [
      { MaDocGia: "DG001", MatKhau: "123456" },
      { MaDocGia: "DG002", MatKhau: "123456" },
    ];

    for (const test of testCases) {
      console.log(`\n📤 Gửi request đăng nhập cho ${test.MaDocGia}...`);

      try {
        const response = await axios.post(`${baseURL}/api/login/reader`, test);

        console.log("✅ Đăng nhập thành công!");
        console.log("📋 Thông tin phản hồi:");
        console.log(`   - Message: ${response.data.message}`);
        console.log(
          `   - User: ${response.data.user.HoTen} (${response.data.user.MaDocGia})`
        );
        console.log(`   - Role: ${response.data.user.role}`);
        console.log(`   - Token: ${response.data.token.substring(0, 20)}...`);
      } catch (error) {
        console.log("❌ Đăng nhập thất bại!");
        if (error.response) {
          console.log(`   - Status: ${error.response.status}`);
          console.log(`   - Message: ${error.response.data.message}`);
        } else {
          console.log(`   - Error: ${error.message}`);
        }
      }
    }

    // Test với thông tin sai
    console.log(`\n📤 Test với mật khẩu sai...`);
    try {
      await axios.post(`${baseURL}/api/login/reader`, {
        MaDocGia: "DG001",
        MatKhau: "wrongpassword",
      });
    } catch (error) {
      console.log("✅ Đúng rồi, mật khẩu sai bị từ chối!");
      console.log(`   - Message: ${error.response.data.message}`);
    }
  } catch (error) {
    console.error("❌ Lỗi khi test API:", error.message);
    console.log("💡 Đảm bảo server đang chạy trên cổng đúng");
  }
}

testLoginAPI();
