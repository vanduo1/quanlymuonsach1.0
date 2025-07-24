const express = require("express");
const bcrypt = require("bcryptjs");
const { client } = require("../config/db");
const { verifyToken, isReader, isLibrarian } = require("../middleware/auth");

const router = express.Router();
const DB_NAME = "quanlymuonsach";

// Đăng ký độc giả mới
router.post("/register", async (req, res) => {
  try {
    console.log("Received registration request:", {
      ...req.body,
      MatKhau: "[HIDDEN]",
    });

    // Check database connection
    if (!client || !client.topology || !client.topology.isConnected()) {
      console.error("Database is not connected");
      await client.connect();
    }

    const db = client.db(DB_NAME);
    console.log("Using database:", DB_NAME);

    const docGiaCollection = db.collection("docgias");
    console.log("Using collection: docgias");
    const { HoTen, Email, MatKhau, SoDienThoai, DiaChi, NgaySinh } = req.body;

    // Validate required fields
    if (!HoTen || !Email || !MatKhau || !SoDienThoai || !DiaChi || !NgaySinh) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ thông tin!",
        missingFields: Object.entries({
          HoTen,
          Email,
          MatKhau,
          SoDienThoai,
          DiaChi,
          NgaySinh,
        })
          .filter(([_, value]) => !value)
          .map(([key]) => key),
      });
    }

    // Get all existing readers to find the highest ID
    const allDocGias = await docGiaCollection
      .find({}, { MaDocGia: 1 })
      .toArray();
    console.log("Found existing readers:", allDocGias.length);

    // Extract the highest numeric ID
    const lastId = allDocGias.reduce((max, docGia) => {
      const id = parseInt(docGia.MaDocGia?.slice(2) || "0");
      return isNaN(id) ? max : Math.max(max, id);
    }, 0);

    const newMaDocGia = `DG${String(lastId + 1).padStart(4, "0")}`;
    console.log("Generated new reader ID:", newMaDocGia);

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(MatKhau, 10);

    // Tạo độc giả mới
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    const newDocGia = {
      MaDocGia: newMaDocGia,
      HoTen,
      Email,
      MatKhau: hashedPassword, // Make sure we use MatKhau consistently
      SoDienThoai,
      DiaChi,
      NgaySinh: new Date(NgaySinh),
      NgayDangKy: today,
      NgayHetHan: nextYear,
      TrangThai: "Hoạt động",
    };

    console.log("Attempting to insert new reader:", {
      ...newDocGia,
      MatKhau: "[HIDDEN]",
    });

    const result = await docGiaCollection.insertOne(newDocGia);
    console.log("Insert result:", result);

    if (!result.acknowledged) {
      throw new Error("Không thể thêm độc giả mới");
    }

    // Verify the insert by reading back the document
    const insertedDoc = await docGiaCollection.findOne({
      MaDocGia: newMaDocGia,
    });
    if (!insertedDoc) {
      throw new Error("Không tìm thấy độc giả sau khi thêm");
    }

    console.log("Successfully created reader with ID:", newMaDocGia);

    res.status(201).json({
      message: "Đăng ký tài khoản thành công!",
      MaDocGia: newMaDocGia,
    });
  } catch (err) {
    console.error("❌ Lỗi đăng ký độc giả:", err);
    res.status(500).json({
      message: "Lỗi máy chủ!",
      error: err.message,
    });
  }
});

// Tạo độc giả mới (dành cho nhân viên)
router.post("/", verifyToken, isLibrarian, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const docGiaCollection = db.collection("docgias");

    const { MaDocGia, HoTen, Email, MatKhau, SoDienThoai, DiaChi, NgaySinh } =
      req.body;

    // Validate required fields
    if (!MaDocGia || !HoTen || !Email || !MatKhau) {
      return res.status(400).json({
        message:
          "Vui lòng điền đầy đủ thông tin bắt buộc (Mã độc giả, Họ tên, Email, Mật khẩu)!",
      });
    }

    // Kiểm tra mã độc giả đã tồn tại
    const existingMaDocGia = await docGiaCollection.findOne({ MaDocGia });
    if (existingMaDocGia) {
      return res.status(400).json({ message: "Mã độc giả đã tồn tại!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(MatKhau, 10);

    // Tạo độc giả mới
    const newDocGia = {
      MaDocGia,
      HoTen,
      Email,
      MatKhau: hashedPassword,
      SoDienThoai: SoDienThoai || "",
      DiaChi: DiaChi || "",
      NgaySinh: NgaySinh ? new Date(NgaySinh) : null,
      NgayDangKy: new Date(),
      TrangThai: "hoat_dong",
    };

    const result = await docGiaCollection.insertOne(newDocGia);

    if (result.insertedId) {
      res.status(201).json({
        message: "Tạo độc giả thành công!",
        MaDocGia: newDocGia.MaDocGia,
        docGia: {
          MaDocGia: newDocGia.MaDocGia,
          HoTen: newDocGia.HoTen,
          Email: newDocGia.Email,
          SoDienThoai: newDocGia.SoDienThoai,
          DiaChi: newDocGia.DiaChi,
          NgaySinh: newDocGia.NgaySinh,
          NgayDangKy: newDocGia.NgayDangKy,
          TrangThai: newDocGia.TrangThai,
        },
      });
    } else {
      res.status(500).json({ message: "Không thể tạo độc giả!" });
    }
  } catch (err) {
    console.error("❌ Lỗi tạo độc giả:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Lấy thông tin độc giả
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const docGiaCollection = db.collection("docgias");

    const docGia = await docGiaCollection.findOne(
      { MaDocGia: req.params.id },
      { projection: { MatKhau: 0 } }
    );

    if (!docGia) {
      return res.status(404).json({ message: "Không tìm thấy độc giả!" });
    }

    // Chỉ cho phép độc giả xem thông tin của chính mình hoặc thủ thư
    if (req.user.role === "reader" && req.user.userId !== req.params.id) {
      return res.status(403).json({ message: "Không có quyền truy cập!" });
    }

    res.json(docGia);
  } catch (err) {
    console.error("❌ Lỗi lấy thông tin độc giả:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Cập nhật thông tin độc giả
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const docGiaCollection = db.collection("docgias");
    const { HoTen, Email, SoDienThoai, DiaChi, CurrentPassword, NewPassword } =
      req.body;

    // Chỉ cho phép độc giả cập nhật thông tin của chính mình
    if (req.user.role === "reader" && req.user.userId !== req.params.id) {
      return res.status(403).json({ message: "Không có quyền truy cập!" });
    }

    const docGia = await docGiaCollection.findOne({ MaDocGia: req.params.id });
    if (!docGia) {
      return res.status(404).json({ message: "Không tìm thấy độc giả!" });
    }

    // Cập nhật thông tin
    const updateData = {
      HoTen,
      Email,
      SoDienThoai,
      DiaChi,
    };

    // Nếu có yêu cầu đổi mật khẩu
    if (CurrentPassword && NewPassword) {
      const isPasswordValid = await bcrypt.compare(
        CurrentPassword,
        docGia.MatKhau
      );
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ message: "Mật khẩu hiện tại không đúng!" });
      }
      updateData.MatKhau = await bcrypt.hash(NewPassword, 10);
    }

    await docGiaCollection.updateOne(
      { MaDocGia: req.params.id },
      { $set: updateData }
    );

    res.json({ message: "Cập nhật thông tin thành công!" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật thông tin độc giả:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Lấy danh sách độc giả (chỉ cho thủ thư)
router.get("/", verifyToken, isLibrarian, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const docGiaCollection = db.collection("docgias");

    const {
      search, // Tìm kiếm theo tên, email, mã độc giả
      page = 1, // Trang hiện tại
      limit = 10, // Số bản ghi mỗi trang
    } = req.query;

    // Xây dựng query
    const query = {};

    if (search) {
      query.$or = [
        { MaDocGia: { $regex: search, $options: "i" } },
        { HoTen: { $regex: search, $options: "i" } },
        { Email: { $regex: search, $options: "i" } },
      ];
    }

    // Thực hiện query với phân trang
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [docGias, totalCount] = await Promise.all([
      docGiaCollection
        .find(query, { projection: { MatKhau: 0 } })
        .sort({ NgayDangKy: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      docGiaCollection.countDocuments(query),
    ]);

    res.json({
      docgias: docGias,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách độc giả:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

module.exports = router;
