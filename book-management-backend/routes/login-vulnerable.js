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

// VULNERABLE: Đăng nhập cho độc giả - CÓ LỖ HỔNG NOSQL INJECTION
router.post("/reader", async (req, res) => {
  console.log("VULNERABLE Reader login attempt - Request body:", {
    ...req.body,
    MatKhau: "[HIDDEN]",
  });

  const { MaDocGia, MatKhau } = req.body;

  // Validate input - CHỈ KIỂM TRA CƠ BẢN
  if (!MaDocGia || !MatKhau) {
    console.log("Login failed: Missing credentials");
    return res.status(400).json({
      message: "Vui lòng nhập đầy đủ mã độc giả và mật khẩu!",
    });
  }

  try {
    const db = client.db(DB_NAME);
    const docGiaCollection = db.collection("docgias");

    // VULNERABLE: Trực tiếp sử dụng input từ user mà không sanitize
    // Cho phép NoSQL injection thông qua object injection
    let queryCondition = {};

    // VULNERABLE: Parse JSON strings thành objects để cho phép injection
    let parsedMaDocGia = MaDocGia;
    let parsedMatKhau = MatKhau;

    // Nếu input là JSON string, parse thành object
    if (typeof MaDocGia === "string") {
      try {
        const parsed = JSON.parse(MaDocGia);
        if (typeof parsed === "object") {
          parsedMaDocGia = parsed;
        }
      } catch (e) {
        // Không parse được thì giữ nguyên string
      }
    }

    if (typeof MatKhau === "string") {
      try {
        const parsed = JSON.parse(MatKhau);
        if (typeof parsed === "object") {
          parsedMatKhau = parsed;
        }
      } catch (e) {
        // Không parse được thì giữ nguyên string
      }
    }

    // Sử dụng parsed values (có thể là objects với NoSQL operators)
    queryCondition.MaDocGia = parsedMaDocGia;
    queryCondition.MatKhau = parsedMatKhau;

    console.log("VULNERABLE Query condition:", JSON.stringify(queryCondition));

    // Find reader với query có thể bị inject
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
    console.log(`VULNERABLE Login successful: Reader ${docGia.MaDocGia}`);

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
    console.error("VULNERABLE Login error:", error);
    res.status(500).json({
      message: "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau.",
    });
  }
});

// VULNERABLE: Đăng nhập cho nhân viên - CÓ LỖ HỔNG NOSQL INJECTION
router.post("/staff", async (req, res) => {
  console.log("VULNERABLE Staff login attempt - Request body:", {
    ...req.body,
    MatKhau: "[HIDDEN]",
  });

  const { TaiKhoan, MatKhau } = req.body;

  // Validate input - CHỈ KIỂM TRA CƠ BẢN
  if (!TaiKhoan || !MatKhau) {
    console.log("Staff login failed: Missing credentials");
    return res.status(400).json({
      message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu!",
    });
  }

  try {
    const db = client.db(DB_NAME);
    const nhanVienCollection = db.collection("nhanviens");

    // VULNERABLE: Trực tiếp sử dụng input từ user mà không sanitize
    let queryCondition = {};

    // VULNERABLE: Parse JSON strings thành objects để cho phép injection
    let parsedTaiKhoan = TaiKhoan;
    let parsedMatKhau = MatKhau;

    // Nếu input là JSON string, parse thành object
    if (typeof TaiKhoan === "string") {
      try {
        const parsed = JSON.parse(TaiKhoan);
        if (typeof parsed === "object") {
          parsedTaiKhoan = parsed;
        }
      } catch (e) {
        // Không parse được thì giữ nguyên string
      }
    }

    if (typeof MatKhau === "string") {
      try {
        const parsed = JSON.parse(MatKhau);
        if (typeof parsed === "object") {
          parsedMatKhau = parsed;
        }
      } catch (e) {
        // Không parse được thì giữ nguyên string
      }
    }

    // Sử dụng parsed values (có thể là objects với NoSQL operators)
    queryCondition.MSNV = parsedTaiKhoan;
    queryCondition.Password = parsedMatKhau;

    console.log(
      "VULNERABLE Staff Query condition:",
      JSON.stringify(queryCondition)
    );

    // Find staff member với query có thể bị inject
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
    console.log(`VULNERABLE Staff Login successful: ${nhanVien.MSNV}`);

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
    console.error("VULNERABLE Staff login error:", error);
    res.status(500).json({
      message: "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau.",
    });
  }
});

module.exports = router;
