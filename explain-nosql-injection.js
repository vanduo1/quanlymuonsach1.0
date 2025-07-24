// Demo giải thích NoSQL injection với $ne operator

console.log("=".repeat(60));
console.log('🔍 GIẢI THÍCH TẠI SAO {"$ne": null} BYPASS ĐƯỢC AUTHENTICATION');
console.log("=".repeat(60));

console.log("\n1. 📊 TRẠNG THÁI DỮ LIỆU TRONG DATABASE:");
console.log("   Giả sử trong collection 'docgias' có:");
console.log("   {");
console.log("     _id: ObjectId('...'),");
console.log("     MaDocGia: 'DG001',");
console.log("     HoTen: 'Nguyễn Văn A',");
console.log("     MatKhau: 'hashed_password_123',");
console.log("     Email: 'nguyenvana@email.com'");
console.log("   }");

console.log("\n2. 🔒 QUERY BÌNH THƯỜNG (SECURE):");
console.log("   Input: MaDocGia='DG001', MatKhau='wrong_password'");
console.log("   Query: db.docgias.findOne({");
console.log("     MaDocGia: 'DG001',");
console.log("     MatKhau: 'wrong_password'");
console.log("   })");
console.log("   ✅ Kết quả: null (không tìm thấy) - ĐĂNG NHẬP THẤT BẠI");

console.log("\n3. 💥 QUERY BỊ INJECT (VULNERABLE):");
console.log("   Input: MaDocGia='{\"$ne\": null}', MatKhau='{\"$ne\": null}'");
console.log("   Sau khi parse JSON:");
console.log("   Query: db.docgias.findOne({");
console.log('     MaDocGia: {"$ne": null},');
console.log('     MatKhau: {"$ne": null}');
console.log("   })");
console.log(
  "   ❌ Kết quả: Trả về user đầu tiên có MaDocGia ≠ null VÀ MatKhau ≠ null"
);

console.log("\n4. 🎯 TẠI SAO BYPASS ĐƯỢC?");
console.log("   ➤ {\"$ne\": null} = 'khác null' = 'có giá trị'");
console.log("   ➤ Hầu hết users trong DB đều có MaDocGia và MatKhau khác null");
console.log("   ➤ Query sẽ match với user đầu tiên tìm thấy");
console.log("   ➤ Không cần biết password thật là gì!");

console.log("\n5. 📋 CÁC MONGODB OPERATORS KHÁC CŨNG NGUY HIỂM:");
console.log('   • {"$exists": true}  - Tìm field tồn tại');
console.log('   • {"$regex": ".*"}   - Match mọi giá trị');
console.log('   • {"$gt": ""}        - Lớn hơn empty string');
console.log('   • {"$in": [""]}      - Trong mảng giá trị');

console.log("\n6. 🚨 DEMO VỚI DỮ LIỆU MẪU:");

// Giả lập data trong MongoDB
const fakeDatabase = [
  {
    _id: "60d0fe4f5311236168a109ca",
    MaDocGia: "DG001",
    HoTen: "Nguyễn Văn A",
    MatKhau: "hashed_password_123",
    Email: "nguyenvana@email.com",
  },
  {
    _id: "60d0fe4f5311236168a109cb",
    MaDocGia: "DG002",
    HoTen: "Trần Thị B",
    MatKhau: "another_hashed_pass",
    Email: "tranthib@email.com",
  },
];

console.log("   📦 Database có dữ liệu:", fakeDatabase.length, "users");

// Simulate secure query
function secureQuery(maDocGia, matKhau) {
  return fakeDatabase.find(
    (user) => user.MaDocGia === maDocGia && user.MatKhau === matKhau
  );
}

// Simulate vulnerable query with $ne
function vulnerableQuery(maDocGiaCondition, matKhauCondition) {
  return fakeDatabase.find((user) => {
    let matchMaDocGia = false;
    let matchMatKhau = false;

    // Check MaDocGia condition
    if (maDocGiaCondition.$ne !== undefined) {
      matchMaDocGia = user.MaDocGia !== maDocGiaCondition.$ne;
    }

    // Check MatKhau condition
    if (matKhauCondition.$ne !== undefined) {
      matchMatKhau = user.MatKhau !== matKhauCondition.$ne;
    }

    return matchMaDocGia && matchMatKhau;
  });
}

console.log("\n   🔒 Test secure query:");
console.log("      Input: MaDocGia='DG001', MatKhau='wrong_password'");
const secureResult = secureQuery("DG001", "wrong_password");
console.log(
  "      Result:",
  secureResult ? "✅ Found user" : "❌ No user found"
);

console.log("\n   💥 Test vulnerable query:");
console.log("      Input: MaDocGia={$ne: null}, MatKhau={$ne: null}");
const vulnerableResult = vulnerableQuery({ $ne: null }, { $ne: null });
console.log(
  "      Result:",
  vulnerableResult
    ? `✅ Found user: ${vulnerableResult.HoTen}`
    : "❌ No user found"
);

console.log("\n7. 🛡️ CÁCH PHÒNG CHỐNG:");
console.log("   ✅ Validate input type: chỉ chấp nhận string");
console.log("   ✅ Sanitize input: loại bỏ MongoDB operators");
console.log("   ✅ Use schema validation (Joi, express-validator)");
console.log("   ✅ Hash passwords với bcrypt");
console.log("   ✅ Không parse JSON object từ user input");

console.log("\n" + "=".repeat(60));
console.log('🎯 KẾT LUẬN: {"$ne": null} bypass authentication vì:');
console.log("   • Tìm user có MaDocGia ≠ null (hầu hết users đều thỏa mãn)");
console.log("   • Tìm user có MatKhau ≠ null (hầu hết users đều thỏa mãn)");
console.log("   • MongoDB trả về user đầu tiên match điều kiện");
console.log("   • Không cần biết password thật!");
console.log("=".repeat(60));
