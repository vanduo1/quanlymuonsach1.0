const express = require("express");
const jwt = require("jsonwebtoken");
const { client } = require("../config/db");
require("dotenv").config();

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
const DB_NAME = "quanlymuonsach";

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

  // Validate input - kiểm tra kiểu dữ liệu là chuỗi
  if (
    !MaDocGia ||
    !MatKhau ||
    typeof MaDocGia !== "string" ||
    typeof MatKhau !== "string"
  ) {
    console.log("Login failed: Missing or invalid credentials");
    return res.status(400).json({
      message: "Vui lòng nhập đầy đủ mã độc giả và mật khẩu!",
    });
  }

  try {
    const db = client.db(DB_NAME);
    const docGiaCollection = db.collection("docgias");

    // Chỉ sử dụng giá trị chuỗi, không parse JSON, không cho phép object injection
    const queryCondition = {
      MaDocGia,
      MatKhau,
    };

    console.log("SAFE Query condition:", JSON.stringify(queryCondition));

    // Find reader với query đã được bảo vệ
    const docGia = await docGiaCollection.findOne(queryCondition);
    console.log("Reader lookup result:", docGia ? "Found" : "Not found");

    if (!docGia) {
      console.log(
        `Login failed: Reader not found with condition:`,
        queryCondition
      );
      return res.status(401).json({
        message: "Thông tin đăng nhập không đúng!",
      });
    }

    // Check account status
    if (docGia.TrangThai && docGia.TrangThai !== "Hoạt động") {
      console.log(`Login failed: Reader account status is ${docGia.TrangThai}`);
      return res.status(401).json({
        message: `Tài khoản đã bị ${docGia.TrangThai.toLowerCase()}. Vui lòng liên hệ thủ thư để được hỗ trợ.`,
      });
    }

    // Generate token and send response
    const token = generateToken(docGia, "reader");
    console.log(`Login successful: Reader ${docGia.MaDocGia}`);

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

  // Validate input - kiểm tra kiểu dữ liệu là chuỗi
  if (
    !TaiKhoan ||
    !MatKhau ||
    typeof TaiKhoan !== "string" ||
    typeof MatKhau !== "string"
  ) {
    console.log("Staff login failed: Missing or invalid credentials");
    return res.status(400).json({
      message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu!",
    });
  }

  try {
    const db = client.db(DB_NAME);
    const nhanVienCollection = db.collection("nhanviens");

    // Chỉ sử dụng giá trị chuỗi, không parse JSON, không cho phép object injection
    const queryCondition = {
      MSNV: TaiKhoan,
      Password: MatKhau,
    };

    console.log("SAFE Staff Query condition:", JSON.stringify(queryCondition));

    // Find staff member với query đã được bảo vệ
    const nhanVien = await nhanVienCollection.findOne(queryCondition);
    console.log("Staff lookup result:", nhanVien ? "Found" : "Not found");

    if (!nhanVien) {
      console.log(
        `Login failed: Staff not found with condition:`,
        queryCondition
      );
      return res.status(401).json({
        message: "Thông tin đăng nhập không đúng!",
      });
    }

    // Generate token and send response
    const token = generateToken(nhanVien, nhanVien.Role);
    console.log(`Staff Login successful: ${nhanVien.MSNV}`);

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
