const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { client } = require("../config/db");
require("dotenv").config();

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
const DB_NAME = "quanlymuonsach1";

// Rate limiting setup
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

// Helper function to check rate limit
const checkRateLimit = (userId) => {
  if (loginAttempts.has(userId)) {
    const userAttempts = loginAttempts.get(userId);
    if (
      userAttempts.count >= MAX_ATTEMPTS &&
      Date.now() - userAttempts.firstAttempt < LOCK_TIME
    ) {
      return false;
    }
    if (Date.now() - userAttempts.firstAttempt >= LOCK_TIME) {
      loginAttempts.delete(userId);
    }
  }
  return true;
};

// Helper function to record login attempt
const recordLoginAttempt = (userId) => {
  if (loginAttempts.has(userId)) {
    const userAttempts = loginAttempts.get(userId);
    userAttempts.count += 1;
  } else {
    loginAttempts.set(userId, {
      count: 1,
      firstAttempt: Date.now(),
    });
  }
};

// Hàm tạo JWT token
const generateToken = (user, role) => {
  return jwt.sign(
    {
      id: user._id,
      role: role,
      userId: role === "reader" ? user.MaDocGia : user.MSNV,
      fullName: role === "reader" ? user.HoTen : user.HoTenNV,
    },
    SECRET_KEY,
    { expiresIn: "24h" }
  );
};

// Đăng nhập cho độc giả
router.post("/reader", async (req, res) => {
  console.log("Reader login attempt - Request body:", {
    ...req.body,
    MatKhau: "[HIDDEN]",
  });

  const { MaDocGia, MatKhau } = req.body;

  // Validate input
  if (!MaDocGia || !MatKhau) {
    console.log("Login failed: Missing credentials");
    return res.status(400).json({
      message: "Vui lòng nhập đầy đủ mã độc giả và mật khẩu!",
    });
  }

  // Check rate limit
  if (!checkRateLimit(MaDocGia)) {
    return res.status(429).json({
      message:
        "Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau 15 phút.",
    });
  }

  try {
    const db = client.db(DB_NAME);
    const docGiaCollection = db.collection("docgias");

    // Find reader
    const docGia = await docGiaCollection.findOne({ MaDocGia });
    console.log("Reader lookup result:", docGia ? "Found" : "Not found");

    if (!docGia) {
      recordLoginAttempt(MaDocGia);
      console.log(`Login failed: Reader ${MaDocGia} not found`);
      return res.status(401).json({
        message: "Mã độc giả không tồn tại!",
      });
    }

    // Check if password is set
    if (!docGia.MatKhau) {
      console.log(`Login failed: Reader ${MaDocGia} has no password set`);
      return res.status(401).json({
        message: "Tài khoản chưa được thiết lập mật khẩu!",
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(MatKhau, docGia.MatKhau);
    console.log("Password validation result:", isPasswordValid);

    if (!isPasswordValid) {
      recordLoginAttempt(MaDocGia);
      console.log(`Login failed: Invalid password for reader ${MaDocGia}`);
      return res.status(401).json({
        message: "Mật khẩu không đúng!",
      });
    }

    // Check account status
    if (docGia.TrangThai !== "Hoạt động") {
      console.log(
        `Login failed: Reader ${MaDocGia} account status is ${docGia.TrangThai}`
      );
      return res.status(401).json({
        message: `Tài khoản đã bị ${docGia.TrangThai.toLowerCase()}. Vui lòng liên hệ thủ thư để được hỗ trợ.`,
      });
    }

    // Reset login attempts on successful login
    loginAttempts.delete(MaDocGia);

    // Generate token and send response
    const token = generateToken(docGia, "reader");
    console.log(`Login successful: Reader ${MaDocGia}`);

    res.json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        MaDocGia: docGia.MaDocGia,
        HoTen: docGia.HoTen,
        Email: docGia.Email,
        NgayHetHan: docGia.NgayHetHan,
        role: "reader",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau.",
    });
  }
});

// Đăng nhập cho nhân viên
router.post("/staff", async (req, res) => {
  console.log("Staff login attempt - Request body:", {
    ...req.body,
    MatKhau: "[HIDDEN]",
  });

  const { TaiKhoan, MatKhau } = req.body;

  // Validate input
  if (!TaiKhoan || !MatKhau) {
    console.log("Staff login failed: Missing credentials");
    return res.status(400).json({
      message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu!",
    });
  }

  // Check rate limit
  if (!checkRateLimit(TaiKhoan)) {
    return res.status(429).json({
      message:
        "Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau 15 phút.",
    });
  }

  try {
    const db = client.db(DB_NAME);
    const nhanVienCollection = db.collection("nhanviens");

    // Find staff member
    const nhanVien = await nhanVienCollection.findOne({ MSNV: TaiKhoan });
    console.log("Staff lookup result:", nhanVien ? "Found" : "Not found");

    if (!nhanVien) {
      recordLoginAttempt(TaiKhoan);
      console.log(`Login failed: Staff account ${TaiKhoan} not found`);
      return res.status(401).json({
        message: "Tài khoản không tồn tại!",
      });
    }

    // Check if password is set
    if (!nhanVien.Password) {
      console.log(
        `Login failed: Staff account ${TaiKhoan} has no password set`
      );
      return res.status(401).json({
        message: "Tài khoản chưa được thiết lập mật khẩu!",
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(MatKhau, nhanVien.Password);
    console.log("Password validation result:", isPasswordValid);

    if (!isPasswordValid) {
      recordLoginAttempt(TaiKhoan);
      console.log(
        `Login failed: Invalid password for staff account ${TaiKhoan}`
      );
      return res.status(401).json({
        message: "Mật khẩu không đúng!",
      });
    }

    // Reset login attempts on successful login
    loginAttempts.delete(TaiKhoan);

    // Generate token and send response
    const token = generateToken(nhanVien, nhanVien.Role);
    console.log(`Login successful: Staff ${TaiKhoan}`);

    res.json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        MSNV: nhanVien.MSNV,
        HoTenNV: nhanVien.HoTenNV,
        ChucVu: nhanVien.ChucVu,
        role: nhanVien.Role,
      },
    });
  } catch (error) {
    console.error("Staff login error:", error);
    res.status(500).json({
      message: "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau.",
    });
  }
});

module.exports = router;
