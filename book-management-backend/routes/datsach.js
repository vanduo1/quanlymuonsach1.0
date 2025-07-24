const express = require("express");
const { client } = require("../config/db");
const { verifyToken } = require("../middleware/auth");
const { ObjectId } = require("mongodb");

const router = express.Router();
const DB_NAME = "quanlymuonsach";

// Lấy danh sách đặt sách với filter và phân trang
router.get("/", verifyToken, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const datSachCollection = db.collection("datsachs");
    const sachCollection = db.collection("sachs");
    const docGiaCollection = db.collection("docgias");

    const {
      search, // Tìm kiếm theo mã sách, tên sách, mã độc giả
      trangThai, // Filter theo trạng thái
      tuNgay, // Filter theo ngày đặt
      denNgay,
      page = 1, // Trang hiện tại
      limit = 10, // Số bản ghi mỗi trang
    } = req.query;

    // Xây dựng query
    const query = {};

    // Nếu là độc giả, chỉ xem được phiếu đặt của mình
    if (req.user.role === "reader") {
      query.MaDocGia = req.user.userId;
      console.log(
        `🔍 Reader filter for datsach: Looking for reservations with MaDocGia = ${req.user.userId}`
      );
    }

    if (search) {
      query.$or = [
        { MaSach: { $regex: search, $options: "i" } },
        { MaDocGia: { $regex: search, $options: "i" } },
      ];
    }

    if (trangThai) {
      query.TrangThai = trangThai;
    }

    if (tuNgay) {
      query.NgayDat = { $gte: new Date(tuNgay) };
    }

    if (denNgay) {
      query.NgayDat = { ...query.NgayDat, $lte: new Date(denNgay) };
    }

    // Thực hiện query với phân trang
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [datSachs, totalCount] = await Promise.all([
      datSachCollection
        .find(query)
        .sort({ NgayDat: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      datSachCollection.countDocuments(query),
    ]);

    // Lấy thông tin sách và độc giả
    const sachIds = datSachs.map((ds) => ds.MaSach);
    const docGiaIds = datSachs.map((ds) => ds.MaDocGia);

    const [sachs, docGias] = await Promise.all([
      sachCollection.find({ MaSach: { $in: sachIds } }).toArray(),
      docGiaCollection.find({ MaDocGia: { $in: docGiaIds } }).toArray(),
    ]);

    // Map thông tin vào kết quả
    const datSachsWithInfo = datSachs.map((ds) => ({
      ...ds,
      ThongTinSach: sachs.find((s) => s.MaSach === ds.MaSach),
      ThongTinDocGia: docGias.find((dg) => dg.MaDocGia === ds.MaDocGia),
    }));

    res.json({
      datSachs: datSachsWithInfo,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách đặt sách:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Tạo phiếu đặt sách mới
router.post("/", verifyToken, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const datSachCollection = db.collection("datsachs");
    const sachCollection = db.collection("sachs");
    const docGiaCollection = db.collection("docgias");

    const { MaSach, SoLuong, TrangThai, GhiChu } = req.body;

    console.log("Debug - User info:", {
      userFromRequest: req.user,
      reqBody: req.body,
    });

    // Kiểm tra quyền người dùng
    if (req.user.role !== "reader") {
      return res
        .status(403)
        .json({ message: "Chỉ độc giả mới có thể đặt sách!" });
    }

    // Kiểm tra thông tin độc giả - dùng userId từ token
    const MaDocGia = req.user.userId; // Lấy từ JWT token
    let docGia = await docGiaCollection.findOne({
      MaDocGia: MaDocGia,
    });

    console.log("Debug - Found DocGia:", docGia);

    if (!docGia) {
      return res.status(404).json({
        message:
          "Không tìm thấy thông tin độc giả! Vui lòng kiểm tra lại đăng nhập.",
      });
    }

    // Sử dụng MaDocGia từ thông tin độc giả tìm được
    const maDocGiaToUse = docGia.MaDocGia || docGia._id;

    // Kiểm tra thông tin sách
    const sach = await sachCollection.findOne({ MaSach: MaSach });
    if (!sach) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin sách!" });
    }

    // Kiểm tra số lượng sách nếu là mượn trực tiếp
    if (TrangThai === "cho_duyet" && sach.SoLuong < SoLuong) {
      return res
        .status(400)
        .json({ message: "Số lượng sách không đủ để mượn!" });
    }

    // Kiểm tra số lượng sách đang mượn của độc giả
    const muonSachCollection = db.collection("muonsachs");
    const dangMuon = await muonSachCollection.countDocuments({
      MaDocGia: maDocGiaToUse,
      TrangThai: "dang_muon",
    });

    if (dangMuon >= 3) {
      return res.status(400).json({
        message:
          "Bạn đã mượn tối đa 3 cuốn sách! Vui lòng trả sách trước khi mượn thêm.",
      });
    }

    // Kiểm tra nếu độc giả đã đặt/mượn sách này trước đó
    const existingRequest = await datSachCollection.findOne({
      MaDocGia: maDocGiaToUse,
      MaSach: MaSach,
      TrangThai: { $in: ["cho_duyet", "dat_cho"] },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Bạn đã có yêu cầu mượn/đặt cho cuốn sách này!",
      });
    }

    // Tạo mã đặt sách tự động
    const lastReservation = await datSachCollection.findOne(
      {},
      { sort: { MaDat: -1 } }
    );

    let nextMaDat = "DS001";
    if (lastReservation && lastReservation.MaDat) {
      const lastNumber = parseInt(lastReservation.MaDat.substring(2));
      nextMaDat = `DS${String(lastNumber + 1).padStart(3, "0")}`;
    }

    // Tạo phiếu đặt sách
    const datSach = {
      MaDat: nextMaDat,
      MaSach: MaSach,
      MaDocGia: maDocGiaToUse,
      SoLuong,
      TrangThai,
      NgayDat: new Date(),
      GhiChu,
    };

    const result = await datSachCollection.insertOne(datSach);

    // Nếu là mượn trực tiếp, cập nhật số lượng sách
    if (TrangThai === "cho_duyet") {
      await sachCollection.updateOne(
        { MaSach: MaSach },
        { $inc: { SoLuong: -SoLuong } }
      );
    }

    res.status(201).json({
      message:
        TrangThai === "cho_duyet"
          ? "Yêu cầu mượn sách đã được gửi thành công!"
          : "Đặt chỗ thành công!",
      datSach: { ...datSach, _id: result.insertedId },
      maDat: nextMaDat,
    });
  } catch (err) {
    console.error("❌ Lỗi khi tạo phiếu đặt sách:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Cập nhật trạng thái phiếu đặt sách (duyệt/hủy)
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const datSachCollection = db.collection("datsachs");
    const sachCollection = db.collection("sachs");
    const muonSachCollection = db.collection("muonsachs");

    const { id } = req.params;
    const { TrangThai, GhiChu } = req.body;

    const datSach = await datSachCollection.findOne({ _id: new ObjectId(id) });
    if (!datSach) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy phiếu đặt sách!" });
    }

    // Cập nhật trạng thái phiếu đặt
    await datSachCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          TrangThai,
          GhiChu,
          NgayCapNhat: new Date(),
        },
      }
    );

    // Xử lý theo trạng thái
    switch (TrangThai) {
      case "da_duyet":
        // Tạo phiếu mượn sách
        await muonSachCollection.insertOne({
          MaSach: datSach.MaSach,
          MaDocGia: datSach.MaDocGia,
          SoLuong: datSach.SoLuong,
          NgayMuon: new Date(),
          NgayHenTra: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 ngày
          TrangThai: "dang_muon",
          GhiChu: "Tạo từ phiếu đặt sách",
        });

        // Cập nhật số lượng sách nếu là đặt chỗ trước
        if (datSach.TrangThai === "dat_cho") {
          await sachCollection.updateOne(
            { _id: new ObjectId(datSach.MaSach) },
            { $inc: { SoLuong: -datSach.SoLuong } }
          );
        }
        break;

      case "da_huy":
        // Hoàn trả số lượng sách nếu là mượn trực tiếp bị hủy
        if (datSach.TrangThai === "cho_duyet") {
          await sachCollection.updateOne(
            { _id: new ObjectId(datSach.MaSach) },
            { $inc: { SoLuong: datSach.SoLuong } }
          );
        }
        break;
    }

    res.json({ message: "Cập nhật trạng thái thành công!" });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật phiếu đặt sách:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Duyệt yêu cầu đặt sách (chỉ thủ thư)
router.put("/:id/duyet", verifyToken, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const datSachCollection = db.collection("datsachs");

    const datSach = await datSachCollection.findOne({ MaDat: req.params.id });
    if (!datSach) {
      return res.status(404).json({ message: "Không tìm thấy phiếu đặt!" });
    }

    if (datSach.TrangThai !== "cho_duyet") {
      return res
        .status(400)
        .json({ message: "Phiếu đặt không ở trạng thái chờ duyệt!" });
    }

    await datSachCollection.updateOne(
      { MaDat: req.params.id },
      { $set: { TrangThai: "da_duyet" } }
    );

    res.json({ message: "Duyệt yêu cầu đặt sách thành công!" });
  } catch (err) {
    console.error("❌ Lỗi duyệt yêu cầu đặt:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Từ chối yêu cầu đặt sách (chỉ thủ thư)
router.put("/:id/tu-choi", verifyToken, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const datSachCollection = db.collection("datsachs");

    const { lyDo } = req.body;
    const datSach = await datSachCollection.findOne({ MaDat: req.params.id });

    if (!datSach) {
      return res.status(404).json({ message: "Không tìm thấy phiếu đặt!" });
    }

    if (datSach.TrangThai !== "cho_duyet") {
      return res
        .status(400)
        .json({ message: "Phiếu đặt không ở trạng thái chờ duyệt!" });
    }

    await datSachCollection.updateOne(
      { MaDat: req.params.id },
      {
        $set: {
          TrangThai: "da_huy",
          GhiChu: lyDo || "Từ chối bởi thủ thư",
          NgayHuy: new Date(),
          NguoiHuy: "thủ thư",
        },
      }
    );

    res.json({ message: "Từ chối yêu cầu đặt sách thành công!" });
  } catch (err) {
    console.error("❌ Lỗi từ chối yêu cầu đặt:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Hủy đặt sách
router.put("/:id/huy", verifyToken, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const datSachCollection = db.collection("datsachs");
    const sachCollection = db.collection("sachs");
    const muonSachCollection = db.collection("muonsachs");

    console.log(`🔍 Tìm phiếu đặt với MaDat: ${req.params.id}`);
    const datSach = await datSachCollection.findOne({ MaDat: req.params.id });
    if (!datSach) {
      return res.status(404).json({ message: "Không tìm thấy phiếu đặt!" });
    }

    console.log("📋 Thông tin phiếu đặt:", {
      MaDat: datSach.MaDat,
      MaDocGia: datSach.MaDocGia,
      TrangThai: datSach.TrangThai,
      userInfo: { userId: req.user.userId, role: req.user.role },
    });

    // Kiểm tra quyền: chỉ thủ thư hoặc chính độc giả đặt sách mới được hủy
    if (req.user.role === "reader" && req.user.userId !== datSach.MaDocGia) {
      console.log("❌ Không có quyền hủy phiếu đặt của người khác");
      return res
        .status(403)
        .json({ message: "Bạn chỉ có thể hủy phiếu đặt của chính mình!" });
    }

    // Kiểm tra trạng thái có thể hủy
    if (!["cho_duyet", "da_duyet", "dat_cho"].includes(datSach.TrangThai)) {
      return res.status(400).json({
        message: "Không thể hủy phiếu đặt ở trạng thái này!",
        currentStatus: datSach.TrangThai,
      });
    }

    // Nếu phiếu đặt đã được duyệt, kiểm tra xem có phiếu mượn tương ứng chưa
    if (datSach.TrangThai === "da_duyet") {
      const existingBorrow = await muonSachCollection.findOne({
        MaDocGia: datSach.MaDocGia,
        MaSach: datSach.MaSach,
        TrangThai: "dang_muon",
      });

      if (existingBorrow) {
        return res.status(400).json({
          message:
            "Không thể hủy đặt sách vì sách đã được mượn! Vui lòng trả sách trước.",
        });
      }
    }

    // Cập nhật trạng thái phiếu đặt
    const updateResult = await datSachCollection.updateOne(
      { MaDat: req.params.id },
      {
        $set: {
          TrangThai: "da_huy",
          NgayHuy: new Date(),
          NguoiHuy: req.user.role === "reader" ? "độc giả" : "thủ thư",
          GhiChu:
            req.body.lyDo ||
            "Hủy bởi " + (req.user.role === "reader" ? "độc giả" : "thủ thư"),
        },
      }
    );

    // Hoàn trả số lượng sách nếu cần thiết
    if (datSach.TrangThai === "cho_duyet") {
      // Với trạng thái "cho_duyet", số lượng sách đã bị trừ khi tạo phiếu đặt
      await sachCollection.updateOne(
        { MaSach: datSach.MaSach },
        { $inc: { SoLuong: datSach.SoLuong } }
      );
      console.log(`📚 Hoàn trả ${datSach.SoLuong} cuốn sách ${datSach.MaSach}`);
    }

    console.log("✅ Hủy đặt sách thành công!");
    const response = {
      message: "Hủy đặt sách thành công!",
      maDat: datSach.MaDat,
      tenSach: datSach.TenSach || "N/A",
      soLuongHoanTra: datSach.TrangThai === "cho_duyet" ? datSach.SoLuong : 0,
    };
    console.log("🔍 Response sẽ gửi:", response);
    res.json(response);
  } catch (err) {
    console.error("❌ Lỗi hủy đặt sách:", err);
    res.status(500).json({ message: "Lỗi máy chủ!", error: err.message });
  }
});

// Export router
module.exports = router;
