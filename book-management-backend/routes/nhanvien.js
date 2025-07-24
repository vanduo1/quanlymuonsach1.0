const express = require("express");
const bcrypt = require("bcryptjs");
const { client } = require("../config/db");
const { verifyToken, isAdmin, isLibrarian } = require("../middleware/auth");

const router = express.Router();
const DB_NAME = "quanlymuonsach";

// Lấy thông tin nhân viên
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const nhanVienCollection = db.collection("nhanviens");

    const nhanVien = await nhanVienCollection.findOne(
      { MSNV: req.params.id },
      { projection: { Password: 0 } }
    );

    if (!nhanVien) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên!" });
    }

    // Chỉ cho phép nhân viên xem thông tin của chính mình hoặc admin
    if (req.user.role !== "admin" && req.user.userId !== req.params.id) {
      return res.status(403).json({ message: "Không có quyền truy cập!" });
    }

    res.json(nhanVien);
  } catch (err) {
    console.error("❌ Lỗi lấy thông tin nhân viên:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Cập nhật thông tin nhân viên
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const nhanVienCollection = db.collection("nhanviens");
    const {
      HoTenNV,
      Email,
      SoDienThoai,
      DiaChi,
      ChucVu,
      CurrentPassword,
      NewPassword,
    } = req.body;

    // Chỉ cho phép nhân viên cập nhật thông tin của chính mình hoặc admin
    if (req.user.role !== "admin" && req.user.userId !== req.params.id) {
      return res.status(403).json({ message: "Không có quyền truy cập!" });
    }

    const nhanVien = await nhanVienCollection.findOne({ MSNV: req.params.id });
    if (!nhanVien) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên!" });
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await nhanVienCollection.findOne({
      Email,
      MSNV: { $ne: req.params.id },
    });
    if (existingEmail) {
      return res.status(400).json({ message: "Email đã được sử dụng!" });
    }

    // Validate chức vụ nếu có cập nhật
    if (ChucVu) {
      const validRoles = ["Admin", "Thủ thư"];
      if (!validRoles.includes(ChucVu)) {
        return res.status(400).json({
          message: "Chức vụ chỉ có thể là 'Admin' hoặc 'Thủ thư'!",
        });
      }
    }

    // Cập nhật thông tin
    const updateData = {
      HoTenNV,
      Email,
      SoDienThoai,
      DiaChi,
    };

    // Thêm ChucVu vào updateData nếu có
    if (ChucVu) {
      updateData.ChucVu = ChucVu;
    }

    // Nếu có yêu cầu đổi mật khẩu
    if (CurrentPassword && NewPassword) {
      const isPasswordValid = await bcrypt.compare(
        CurrentPassword,
        nhanVien.Password
      );
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ message: "Mật khẩu hiện tại không đúng!" });
      }
      updateData.Password = await bcrypt.hash(NewPassword, 10);
    }

    await nhanVienCollection.updateOne(
      { MSNV: req.params.id },
      { $set: updateData }
    );

    res.json({ message: "Cập nhật thông tin thành công!" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật thông tin nhân viên:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Lấy danh sách nhân viên (chỉ cho admin)
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const nhanVienCollection = db.collection("nhanviens");

    const nhanViens = await nhanVienCollection
      .find({}, { projection: { Password: 0 } })
      .toArray();

    res.json(nhanViens);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách nhân viên:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Thêm nhân viên mới (chỉ cho admin)
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    console.log("📥 Request thêm nhân viên:", req.body);

    const db = client.db(DB_NAME);
    const nhanVienCollection = db.collection("nhanviens");
    const { HoTenNV, Email, Password, SoDienThoai, DiaChi, ChucVu } = req.body;

    // Validation required fields
    if (!HoTenNV || !Email || !Password || !SoDienThoai || !DiaChi || !ChucVu) {
      console.log("❌ Validation lỗi: Thiếu thông tin bắt buộc");
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin nhân viên!",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      console.log("❌ Validation lỗi: Email không hợp lệ");
      return res.status(400).json({ message: "Email không hợp lệ!" });
    }

    // Validate phone number (10-11 digits)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(SoDienThoai)) {
      console.log("❌ Validation lỗi: Số điện thoại không hợp lệ");
      return res.status(400).json({
        message: "Số điện thoại phải có 10-11 chữ số!",
      });
    }

    // Validate password length
    if (Password.length < 6) {
      console.log("❌ Validation lỗi: Mật khẩu quá ngắn");
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 6 ký tự!",
      });
    }

    // Validate chức vụ (chỉ cho phép Admin và Thủ thư)
    const validRoles = ["Admin", "Thủ thư"];
    if (!validRoles.includes(ChucVu)) {
      console.log(
        `❌ Validation lỗi: Chức vụ không hợp lệ: "${ChucVu}". Chỉ cho phép: ${validRoles.join(
          ", "
        )}`
      );
      return res.status(400).json({
        message: "Chức vụ chỉ có thể là 'Admin' hoặc 'Thủ thư'!",
      });
    }

    console.log("✅ Tất cả validation đã pass");

    // Kiểm tra email đã tồn tại
    const existingEmail = await nhanVienCollection.findOne({ Email });
    if (existingEmail) {
      console.log("❌ Email đã tồn tại");
      return res.status(400).json({ message: "Email đã được sử dụng!" });
    }

    console.log("✅ Email chưa tồn tại, bắt đầu tạo MSNV...");

    // Tạo mã nhân viên mới
    // Tìm MSNV cao nhất bắt đầu với "NV"
    const allNVCodes = await nhanVienCollection
      .find({ MSNV: { $regex: /^NV\d{4}$/ } })
      .toArray();

    console.log(`🔍 Tìm thấy ${allNVCodes.length} MSNV có format NVxxxx`);

    let maxId = 0;
    allNVCodes.forEach((nv) => {
      if (nv.MSNV && nv.MSNV.startsWith("NV")) {
        const id = parseInt(nv.MSNV.slice(2));
        if (id > maxId) maxId = id;
      }
    });

    console.log(`📊 MaxId hiện tại: ${maxId}`);

    // Tạo MSNV mới
    const newId = maxId + 1;
    const newMSNV = `NV${String(newId).padStart(4, "0")}`;

    console.log(`🆔 MSNV mới sẽ tạo: ${newMSNV}`);

    // Kiểm tra MSNV có tồn tại không (để chắc chắn)
    const existingMSNV = await nhanVienCollection.findOne({ MSNV: newMSNV });
    if (existingMSNV) {
      console.error(`❌ MSNV ${newMSNV} đã tồn tại!`);
      return res.status(500).json({
        message: "Lỗi tạo mã nhân viên!",
      });
    }

    console.log(`✅ MSNV ${newMSNV} chưa tồn tại, tiếp tục tạo nhân viên...`);

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Tạo nhân viên mới
    const newNhanVien = {
      MSNV: newMSNV,
      HoTenNV,
      Email,
      Password: hashedPassword,
      SoDienThoai,
      DiaChi,
      ChucVu,
      Role: "librarian", // Mặc định là thủ thư
      NgayTao: new Date(),
      TrangThai: "active",
    };

    await nhanVienCollection.insertOne(newNhanVien);

    res.status(201).json({
      message: "Thêm nhân viên thành công!",
      MSNV: newMSNV,
    });
  } catch (err) {
    console.error("❌ Lỗi thêm nhân viên:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

module.exports = router;
