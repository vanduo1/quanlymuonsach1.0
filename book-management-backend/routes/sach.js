const express = require("express");
const { client } = require("../config/db");
const { verifyToken, isLibrarian } = require("../middleware/auth");
const { ObjectId } = require("mongodb");

const router = express.Router();
const DB_NAME = "quanlymuonsach";

// Lấy danh sách sách với filter và phân trang
router.get("/", async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const sachCollection = db.collection("sachs");

    const {
      search, // Tìm kiếm theo tên, tác giả
      theLoai, // Filter theo thể loại
      namXuatBan, // Filter theo năm xuất bản
      nhaXuatBan, // Filter theo nhà xuất bản
      trangThai, // Filter theo trạng thái (còn/đã mượn hết)
      page = 1, // Trang hiện tại
      limit = 10, // Số sách mỗi trang
    } = req.query;

    // Xây dựng query
    const query = {};

    if (search) {
      query.$or = [
        { TenSach: { $regex: search, $options: "i" } },
        { TacGia: { $regex: search, $options: "i" } },
      ];
    }

    if (theLoai) {
      query.TheLoai = theLoai;
    }

    if (namXuatBan) {
      query.NamXuatBan = parseInt(namXuatBan);
    }

    if (nhaXuatBan) {
      query.NhaXuatBan = nhaXuatBan;
    }

    if (trangThai) {
      query.SoLuongCon = trangThai === "con" ? { $gt: 0 } : 0;
    }

    // Thực hiện query với phân trang
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sachs, totalCount] = await Promise.all([
      sachCollection
        .find(query)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      sachCollection.countDocuments(query),
    ]);

    // Lấy thông tin mượn sách
    const muonSachCollection = db.collection("muonsachs");
    const sachIds = sachs.map((sach) => sach.MaSach);
    const muonSachStats = await muonSachCollection
      .aggregate([
        { $match: { MaSach: { $in: sachIds } } },
        {
          $group: {
            _id: "$MaSach",
            soLuotMuon: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Map số lượt mượn vào kết quả
    const sachsWithStats = sachs.map((sach) => ({
      ...sach,
      SoLuotMuon:
        muonSachStats.find((stat) => stat._id === sach.MaSach)?.soLuotMuon || 0,
    }));

    res.json({
      sachs: sachsWithStats,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách sách:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Lấy chi tiết sách
router.get("/:id", async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const sachCollection = db.collection("sachs");
    const muonSachCollection = db.collection("muonsachs");

    const sach = await sachCollection.findOne({ MaSach: req.params.id });
    if (!sach) {
      return res.status(404).json({ message: "Không tìm thấy sách!" });
    }

    // Lấy thông tin mượn sách
    const muonSachStats = await muonSachCollection
      .aggregate([
        { $match: { MaSach: sach.MaSach } },
        {
          $group: {
            _id: "$MaSach",
            soLuotMuon: { $sum: 1 },
            dangMuon: {
              $sum: {
                $cond: [{ $eq: ["$TrangThai", "dang_muon"] }, 1, 0],
              },
            },
          },
        },
      ])
      .toArray();

    const stats = muonSachStats[0] || { soLuotMuon: 0, dangMuon: 0 };

    res.json({
      ...sach,
      SoLuotMuon: stats.soLuotMuon,
      SoLuongDangMuon: stats.dangMuon,
    });
  } catch (err) {
    console.error("❌ Lỗi lấy chi tiết sách:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Thêm sách mới (chỉ thủ thư)
router.post("/", verifyToken, isLibrarian, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const sachCollection = db.collection("sachs");
    const {
      TenSach,
      TacGia,
      TheLoai,
      NhaXuatBan,
      MaNXB,
      NamXuatBan,
      SoLuong,
      GiaSach,
      MoTa,
      ISBN,
      HinhAnh,
    } = req.body;

    console.log("📝 Dữ liệu nhận được:", req.body);

    // Kiểm tra các trường bắt buộc
    if (!TenSach || !TacGia || !TheLoai || !NamXuatBan || !SoLuong) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ thông tin bắt buộc!",
      });
    }

    // Kiểm tra ISBN đã tồn tại
    if (ISBN) {
      const existingBook = await sachCollection.findOne({ ISBN });
      if (existingBook) {
        return res.status(400).json({ message: "ISBN đã tồn tại!" });
      }
    }

    // Tạo mã sách mới - sửa cách sắp xếp
    const lastSach = await sachCollection
      .find({}, { MaSach: 1 })
      .sort({ _id: -1 })
      .limit(1)
      .toArray();

    let newMaSach = "MS0001";
    if (lastSach.length > 0 && lastSach[0].MaSach) {
      const lastId = parseInt(lastSach[0].MaSach.replace("MS", ""));
      newMaSach = `MS${String(lastId + 1).padStart(4, "0")}`;
    }

    // Tạo sách mới
    const newSach = {
      MaSach: newMaSach,
      TenSach: TenSach.trim(),
      TacGia: TacGia.trim(),
      TheLoai: TheLoai.trim(),
      NhaXuatBan: NhaXuatBan || MaNXB || "",
      MaNXB: MaNXB || NhaXuatBan || "",
      NamXuatBan: parseInt(NamXuatBan),
      SoLuong: parseInt(SoLuong),
      SoLuongCon: parseInt(SoLuong),
      GiaSach: GiaSach ? parseInt(GiaSach) : 0,
      MoTa: MoTa || "",
      ISBN: ISBN || "",
      HinhAnh: HinhAnh || "",
      NgayThem: new Date(),
      TrangThai: "active",
    };

    console.log("📚 Sách mới được tạo:", newSach);

    const result = await sachCollection.insertOne(newSach);

    res.status(201).json({
      message: "Thêm sách thành công!",
      MaSach: newMaSach,
      _id: result.insertedId,
    });
  } catch (err) {
    console.error("❌ Lỗi thêm sách:", err);
    res.status(500).json({
      message: "Lỗi máy chủ!",
      error: err.message,
    });
  }
});

// Cập nhật sách (chỉ thủ thư)
router.put("/:id", verifyToken, isLibrarian, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const sachCollection = db.collection("sachs");
    const {
      TenSach,
      TacGia,
      TheLoai,
      NhaXuatBan,
      MaNXB,
      NamXuatBan,
      SoLuong,
      GiaSach,
      MoTa,
      ISBN,
      HinhAnh,
    } = req.body;

    console.log("📝 Cập nhật sách - ID:", req.params.id);
    console.log("📝 Dữ liệu cập nhật:", req.body);

    // Tìm sách bằng cả MaSach và _id
    let sach = await sachCollection.findOne({ MaSach: req.params.id });
    if (!sach) {
      // Thử tìm bằng _id
      try {
        sach = await sachCollection.findOne({
          _id: new ObjectId(req.params.id),
        });
      } catch (err) {
        console.log("Không thể chuyển đổi _id:", err.message);
      }
    }

    if (!sach) {
      return res.status(404).json({ message: "Không tìm thấy sách!" });
    }

    // Kiểm tra ISBN đã tồn tại (nếu thay đổi)
    if (ISBN && ISBN !== sach.ISBN) {
      const existingBook = await sachCollection.findOne({
        ISBN,
        MaSach: { $ne: sach.MaSach },
      });
      if (existingBook) {
        return res.status(400).json({ message: "ISBN đã tồn tại!" });
      }
    }

    // Tính toán số lượng còn lại mới
    const soLuongDangMuon = sach.SoLuong - sach.SoLuongCon;
    const soLuongMoi = parseInt(SoLuong);
    const soLuongConMoi = Math.max(0, soLuongMoi - soLuongDangMuon);

    // Cập nhật thông tin
    const updateData = {
      TenSach: TenSach.trim(),
      TacGia: TacGia.trim(),
      TheLoai: TheLoai.trim(),
      NhaXuatBan: NhaXuatBan || MaNXB || "",
      MaNXB: MaNXB || NhaXuatBan || "",
      NamXuatBan: parseInt(NamXuatBan),
      SoLuong: soLuongMoi,
      SoLuongCon: soLuongConMoi,
      GiaSach: GiaSach ? parseInt(GiaSach) : sach.GiaSach || 0,
      MoTa: MoTa || "",
      ISBN: ISBN || "",
      HinhAnh: HinhAnh || "",
      NgayCapNhat: new Date(),
    };

    await sachCollection.updateOne(
      { MaSach: sach.MaSach },
      { $set: updateData }
    );

    res.json({ message: "Cập nhật sách thành công!" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật sách:", err);
    res.status(500).json({
      message: "Lỗi máy chủ!",
      error: err.message,
    });
  }
});

// Xóa sách (chỉ thủ thư)
router.delete("/:id", verifyToken, isLibrarian, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const sachCollection = db.collection("sachs");
    const muonSachCollection = db.collection("muonsachs");

    console.log("🗑️ Xóa sách - ID:", req.params.id);

    // Tìm sách bằng cả MaSach và _id
    let sach = await sachCollection.findOne({ MaSach: req.params.id });
    if (!sach) {
      // Thử tìm bằng _id
      try {
        sach = await sachCollection.findOne({
          _id: new ObjectId(req.params.id),
        });
      } catch (err) {
        console.log("Không thể chuyển đổi _id:", err.message);
      }
    }

    if (!sach) {
      return res.status(404).json({ message: "Không tìm thấy sách!" });
    }

    // Kiểm tra sách có đang được mượn không
    const dangMuon = await muonSachCollection.findOne({
      MaSach: sach.MaSach,
      TrangThai: "dang_muon",
    });

    if (dangMuon) {
      return res
        .status(400)
        .json({ message: "Không thể xóa sách đang được mượn!" });
    }

    const result = await sachCollection.deleteOne({ MaSach: sach.MaSach });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy sách để xóa!" });
    }

    res.json({ message: "Xóa sách thành công!" });
  } catch (err) {
    console.error("❌ Lỗi xóa sách:", err);
    res.status(500).json({
      message: "Lỗi máy chủ!",
      error: err.message,
    });
  }
});

module.exports = router;
