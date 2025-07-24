const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Middleware xác thực token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Không tìm thấy token xác thực!" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token không hợp lệ!" });
  }
};

// Middleware kiểm tra quyền Admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Không có quyền truy cập!" });
  }
  next();
};

// Middleware kiểm tra quyền Thủ thư
const isLibrarian = (req, res, next) => {
  if (req.user.role !== "librarian" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Không có quyền truy cập!" });
  }
  next();
};

// Middleware kiểm tra quyền Độc giả
const isReader = (req, res, next) => {
  if (req.user.role !== "reader") {
    return res.status(403).json({ message: "Không có quyền truy cập!" });
  }
  next();
};

// Middleware kiểm tra quyền Thủ thư hoặc Độc giả
const isLibrarianOrReader = (req, res, next) => {
  if (
    req.user.role !== "librarian" &&
    req.user.role !== "admin" &&
    req.user.role !== "reader"
  ) {
    return res.status(403).json({ message: "Không có quyền truy cập!" });
  }
  next();
};

// Middleware kiểm tra người dùng đã xác thực (bất kỳ vai trò nào)
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Vui lòng đăng nhập!" });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isLibrarian,
  isReader,
  isLibrarianOrReader,
  isAuthenticated,
};
