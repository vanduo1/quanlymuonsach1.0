const axios = require("axios");

// Test login with the vulnerable endpoint
async function testLogin() {
  try {
    console.log("🧪 Testing login with DG001...");

    const response = await axios.post(
      "http://localhost:5001/api/login-vulnerable/reader",
      {
        MaDocGia: "DG001",
        MatKhau: "123456",
      }
    );

    console.log("✅ Login successful!");
    console.log("📄 Response data:", response.data);
  } catch (error) {
    if (error.response) {
      console.log("❌ Login failed!");
      console.log("📄 Error response:", error.response.data);
      console.log("🔢 Status code:", error.response.status);
    } else {
      console.log("❌ Network error:", error.message);
    }
  }
}

testLogin();
