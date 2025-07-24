const express = require("express");
const { client } = require("../config/db");
const { verifyToken, isLibrarian } = require("../middleware/auth");

const router = express.Router();
const DB_NAME = "quanlymuonsach";

// API để lấy danh sách sách có thể mượn
router.get("/available-books", verifyToken, async (req, res) => {
  try {
    console.log("🔍 API available-books được gọi bởi user:", req.user);
    const db = client.db(DB_NAME);
    const sachCollection = db.collection("sachs");

    const books = await sachCollection
      .find({
        SoLuongCon: { $gt: 0 },
      })
      .project({
        MaSach: 1,
        TenSach: 1,
        TacGia: 1,
        SoLuongCon: 1,
      })
      .sort({ TenSach: 1 })
      .toArray();

    console.log(`📚 Tìm thấy ${books.length} cuốn sách có thể mượn`);
    res.json(books);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách sách có thể mượn:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// API để lấy danh sách độc giả
router.get("/available-readers", verifyToken, isLibrarian, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const docGiaCollection = db.collection("docgias");

    const readers = await docGiaCollection
      .find({})
      .project({
        MaDocGia: 1,
        HoTen: 1,
        Email: 1,
      })
      .sort({ HoTen: 1 })
      .toArray();

    res.json(readers);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách độc giả:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Lấy danh sách mượn sách với filter và phân trang
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("🔍 API theodoimuonsach được gọi bởi user:", req.user);
    const db = client.db(DB_NAME);
    const muonSachCollection = db.collection("muonsachs");
    const sachCollection = db.collection("sachs");
    const docGiaCollection = db.collection("docgias");

    const {
      search, // Tìm kiếm theo mã sách, tên sách, mã độc giả
      trangThai, // Filter theo trạng thái (đang_muon, da_tra, qua_han)
      tuNgay, // Filter theo ngày mượn
      denNgay,
      page = 1, // Trang hiện tại
      limit = 10, // Số bản ghi mỗi trang
    } = req.query;

    // Xây dựng query
    const query = {};

    // Nếu là độc giả, chỉ xem được phiếu mượn của mình
    if (req.user.role === "reader") {
      query.MaDocGia = req.user.userId;
      console.log(
        `🔍 Reader filter: Looking for borrows with MaDocGia = ${req.user.userId}`
      );
    }

    if (search) {
      query.$or = [
        { MaSach: { $regex: search, $options: "i" } },
        { MaDocGia: { $regex: search, $options: "i" } },
      ];
    }

    if (trangThai) {
      if (trangThai === "qua_han") {
        query.TrangThai = "dang_muon";
        query.NgayHenTra = { $lt: new Date() };
      } else {
        query.TrangThai = trangThai;
      }
    }

    if (tuNgay) {
      query.NgayMuon = { $gte: new Date(tuNgay) };
    }

    if (denNgay) {
      query.NgayMuon = { ...query.NgayMuon, $lte: new Date(denNgay) };
    }

    // Thực hiện query với phân trang
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log(`🔍 Final query for borrows:`, JSON.stringify(query, null, 2));

    const [muonSachs, totalCount] = await Promise.all([
      muonSachCollection
        .find(query)
        .sort({ NgayMuon: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      muonSachCollection.countDocuments(query),
    ]);

    console.log(
      `📊 Query result: ${totalCount} total, ${muonSachs.length} returned`
    );

    // Lấy thông tin sách và độc giả
    const sachIds = muonSachs.map((ms) => ms.MaSach);
    const docGiaIds = muonSachs.map((ms) => ms.MaDocGia);

    const [sachs, docGias] = await Promise.all([
      sachCollection.find({ MaSach: { $in: sachIds } }).toArray(),
      docGiaCollection.find({ MaDocGia: { $in: docGiaIds } }).toArray(),
    ]);

    // Map thông tin vào kết quả
    const muonSachsWithInfo = muonSachs.map((ms) => ({
      ...ms,
      ThongTinSach: sachs.find((s) => s.MaSach === ms.MaSach),
      ThongTinDocGia: docGias.find((dg) => dg.MaDocGia === ms.MaDocGia),
    }));

    res.json({
      muonSachs: muonSachsWithInfo,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách mượn sách:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Tạo phiếu mượn sách mới
router.post("/", verifyToken, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const muonSachCollection = db.collection("muonsachs");
    const sachCollection = db.collection("sachs");
    const docGiaCollection = db.collection("docgias");

    const { MaSach, NgayHenTra } = req.body;
    let { MaDocGia } = req.body;

    // Nếu là độc giả, tự động lấy MaDocGia từ token
    if (req.user.role === "reader") {
      MaDocGia = req.user.userId; // Sử dụng userId từ token
    }

    // Kiểm tra quyền: chỉ thủ thư tạo được phiếu mượn hoặc độc giả tạo cho chính mình
    if (req.user.role === "reader" && req.user.userId !== MaDocGia) {
      return res.status(403).json({ message: "Không có quyền thực hiện!" });
    }

    // Kiểm tra sách tồn tại và còn có thể mượn
    const sach = await sachCollection.findOne({ MaSach });
    if (!sach) {
      return res.status(404).json({ message: "Không tìm thấy sách!" });
    }
    if (sach.SoLuongCon <= 0) {
      return res.status(400).json({ message: "Sách đã hết!" });
    }

    // Kiểm tra độc giả tồn tại
    const docGia = await docGiaCollection.findOne({ MaDocGia });
    if (!docGia) {
      return res.status(404).json({ message: "Không tìm thấy độc giả!" });
    }

    // Kiểm tra độc giả có đang mượn quá nhiều sách không
    const dangMuon = await muonSachCollection.countDocuments({
      MaDocGia,
      TrangThai: "dang_muon",
    });
    if (dangMuon >= 3) {
      return res
        .status(400)
        .json({ message: "Độc giả đã mượn tối đa số sách cho phép!" });
    }

    // Kiểm tra độc giả có đang mượn sách quá hạn không
    const quaHan = await muonSachCollection.findOne({
      MaDocGia,
      TrangThai: "dang_muon",
      NgayHenTra: { $lt: new Date() },
    });
    if (quaHan) {
      return res
        .status(400)
        .json({ message: "Độc giả đang có sách mượn quá hạn!" });
    }

    // Tạo mã mượn sách mới
    const lastMuonSach = await muonSachCollection
      .find()
      .sort({ MaMuon: -1 })
      .limit(1)
      .toArray();

    const lastId =
      lastMuonSach.length > 0 ? parseInt(lastMuonSach[0].MaMuon.slice(2)) : 0;
    const newMaMuon = `MS${String(lastId + 1).padStart(4, "0")}`;

    // Tạo phiếu mượn mới
    const newMuonSach = {
      MaMuon: newMaMuon,
      MaSach,
      MaDocGia,
      NgayMuon: new Date(),
      NgayHenTra: new Date(NgayHenTra),
      NgayTra: null,
      TrangThai: req.user.role === "reader" ? "cho_duyet" : "dang_muon",
      GhiChu: "",
    };

    await Promise.all([
      muonSachCollection.insertOne(newMuonSach),
      // Nếu thủ thư tạo phiếu, giảm số lượng sách ngay
      req.user.role === "librarian"
        ? sachCollection.updateOne({ MaSach }, { $inc: { SoLuongCon: -1 } })
        : Promise.resolve(),
    ]);

    res.status(201).json({
      message:
        req.user.role === "reader"
          ? "Gửi yêu cầu mượn sách thành công!"
          : "Tạo phiếu mượn thành công!",
      MaMuon: newMaMuon,
    });
  } catch (err) {
    console.error("❌ Lỗi tạo phiếu mượn:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Duyệt yêu cầu mượn sách (chỉ thủ thư)
router.put("/:id/duyet", verifyToken, isLibrarian, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const muonSachCollection = db.collection("muonsachs");
    const sachCollection = db.collection("sachs");

    const muonSach = await muonSachCollection.findOne({
      MaMuon: req.params.id,
    });
    if (!muonSach) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn!" });
    }

    if (muonSach.TrangThai !== "cho_duyet") {
      return res
        .status(400)
        .json({ message: "Phiếu mượn không ở trạng thái chờ duyệt!" });
    }

    // Kiểm tra sách còn có thể mượn
    const sach = await sachCollection.findOne({ MaSach: muonSach.MaSach });
    if (sach.SoLuongCon <= 0) {
      return res.status(400).json({ message: "Sách đã hết!" });
    }

    await Promise.all([
      muonSachCollection.updateOne(
        { MaMuon: req.params.id },
        { $set: { TrangThai: "dang_muon" } }
      ),
      sachCollection.updateOne(
        { MaSach: muonSach.MaSach },
        { $inc: { SoLuongCon: -1 } }
      ),
    ]);

    res.json({ message: "Duyệt yêu cầu mượn sách thành công!" });
  } catch (err) {
    console.error("❌ Lỗi duyệt yêu cầu mượn:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Từ chối yêu cầu mượn sách (chỉ thủ thư)
router.put("/:id/tu-choi", verifyToken, isLibrarian, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const muonSachCollection = db.collection("muonsachs");

    const { lyDo } = req.body;
    const muonSach = await muonSachCollection.findOne({
      MaMuon: req.params.id,
    });

    if (!muonSach) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn!" });
    }

    if (muonSach.TrangThai !== "cho_duyet") {
      return res
        .status(400)
        .json({ message: "Phiếu mượn không ở trạng thái chờ duyệt!" });
    }

    await muonSachCollection.updateOne(
      { MaMuon: req.params.id },
      {
        $set: {
          TrangThai: "tu_choi",
          GhiChu: lyDo || "Không có lý do",
        },
      }
    );

    res.json({ message: "Từ chối yêu cầu mượn sách thành công!" });
  } catch (err) {
    console.error("❌ Lỗi từ chối yêu cầu mượn:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Trả sách (chỉ thủ thư)
router.put("/:id/tra", verifyToken, isLibrarian, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const muonSachCollection = db.collection("muonsachs");
    const sachCollection = db.collection("sachs");

    const muonSach = await muonSachCollection.findOne({
      MaMuon: req.params.id,
    });
    if (!muonSach) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn!" });
    }

    if (muonSach.TrangThai !== "dang_muon") {
      return res
        .status(400)
        .json({ message: "Phiếu mượn không ở trạng thái đang mượn!" });
    }

    await Promise.all([
      muonSachCollection.updateOne(
        { MaMuon: req.params.id },
        {
          $set: {
            TrangThai: "da_tra",
            NgayTra: new Date(),
          },
        }
      ),
      sachCollection.updateOne(
        { MaSach: muonSach.MaSach },
        { $inc: { SoLuongCon: 1 } }
      ),
    ]);

    res.json({ message: "Trả sách thành công!" });
  } catch (err) {
    console.error("❌ Lỗi trả sách:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Gia hạn mượn sách
router.put("/:id/gia-han", verifyToken, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const muonSachCollection = db.collection("muonsachs");
    const { NgayHenTra } = req.body;

    const muonSach = await muonSachCollection.findOne({
      MaMuon: req.params.id,
    });
    if (!muonSach) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn!" });
    }

    // Kiểm tra quyền: chỉ thủ thư hoặc chính độc giả mượn sách mới được gia hạn
    if (req.user.role === "reader" && req.user.userId !== muonSach.MaDocGia) {
      return res.status(403).json({ message: "Không có quyền thực hiện!" });
    }

    if (muonSach.TrangThai !== "dang_muon") {
      return res
        .status(400)
        .json({ message: "Phiếu mượn không ở trạng thái đang mượn!" });
    }

    // Kiểm tra đã quá hạn chưa
    if (new Date(muonSach.NgayHenTra) < new Date()) {
      return res
        .status(400)
        .json({ message: "Không thể gia hạn sách đã quá hạn!" });
    }

    // Nếu là độc giả yêu cầu gia hạn
    if (req.user.role === "reader") {
      await muonSachCollection.updateOne(
        { MaMuon: req.params.id },
        {
          $set: {
            TrangThai: "cho_gia_han",
            NgayHenTraMoi: new Date(NgayHenTra),
          },
        }
      );

      res.json({ message: "Gửi yêu cầu gia hạn thành công!" });
    }
    // Nếu là thủ thư thực hiện gia hạn
    else {
      await muonSachCollection.updateOne(
        { MaMuon: req.params.id },
        {
          $set: {
            NgayHenTra: new Date(NgayHenTra),
            TrangThai: "dang_muon",
          },
        }
      );

      res.json({ message: "Gia hạn mượn sách thành công!" });
    }
  } catch (err) {
    console.error("❌ Lỗi gia hạn mượn sách:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Duyệt yêu cầu gia hạn (chỉ thủ thư)
router.put("/:id/duyet-gia-han", verifyToken, isLibrarian, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const muonSachCollection = db.collection("muonsachs");

    const muonSach = await muonSachCollection.findOne({
      MaMuon: req.params.id,
    });
    if (!muonSach) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn!" });
    }

    if (muonSach.TrangThai !== "cho_gia_han") {
      return res
        .status(400)
        .json({ message: "Phiếu mượn không ở trạng thái chờ gia hạn!" });
    }

    await muonSachCollection.updateOne(
      { MaMuon: req.params.id },
      {
        $set: {
          NgayHenTra: muonSach.NgayHenTraMoi,
          TrangThai: "dang_muon",
        },
        $unset: { NgayHenTraMoi: "" },
      }
    );

    res.json({ message: "Duyệt gia hạn thành công!" });
  } catch (err) {
    console.error("❌ Lỗi duyệt gia hạn:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// Từ chối yêu cầu gia hạn (chỉ thủ thư)
router.put(
  "/:id/tu-choi-gia-han",
  verifyToken,
  isLibrarian,
  async (req, res) => {
    try {
      const db = client.db(DB_NAME);
      const muonSachCollection = db.collection("muonsachs");

      const { lyDo } = req.body;
      const muonSach = await muonSachCollection.findOne({
        MaMuon: req.params.id,
      });

      if (!muonSach) {
        return res.status(404).json({ message: "Không tìm thấy phiếu mượn!" });
      }

      if (muonSach.TrangThai !== "cho_gia_han") {
        return res
          .status(400)
          .json({ message: "Phiếu mượn không ở trạng thái chờ gia hạn!" });
      }

      await muonSachCollection.updateOne(
        { MaMuon: req.params.id },
        {
          $set: {
            TrangThai: "dang_muon",
            GhiChu: lyDo || "Không có lý do",
          },
          $unset: { NgayHenTraMoi: "" },
        }
      );

      res.json({ message: "Từ chối gia hạn thành công!" });
    } catch (err) {
      console.error("❌ Lỗi từ chối gia hạn:", err);
      res.status(500).json({ message: "Lỗi máy chủ!" });
    }
  }
);

// Hủy phiếu mượn sách (độc giả có thể hủy phiếu chờ duyệt của mình)
router.put("/:id/huy", verifyToken, async (req, res) => {
  try {
    const db = client.db(DB_NAME);
    const muonSachCollection = db.collection("muonsachs");
    const sachCollection = db.collection("sachs");

    const muonSach = await muonSachCollection.findOne({
      MaMuon: req.params.id,
    });

    if (!muonSach) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn!" });
    }

    // Kiểm tra quyền: chỉ độc giả tạo phiếu hoặc thủ thư mới được hủy
    if (req.user.role === "reader" && req.user.userId !== muonSach.MaDocGia) {
      return res.status(403).json({ message: "Không có quyền thực hiện!" });
    }

    // Chỉ cho phép hủy phiếu ở trạng thái chờ duyệt hoặc chờ gia hạn
    if (!["cho_duyet", "cho_gia_han"].includes(muonSach.TrangThai)) {
      return res.status(400).json({
        message:
          "Chỉ có thể hủy phiếu mượn ở trạng thái chờ duyệt hoặc chờ gia hạn!",
      });
    }

    // Cập nhật trạng thái phiếu mượn thành "da_huy"
    await muonSachCollection.updateOne(
      { MaMuon: req.params.id },
      {
        $set: {
          TrangThai: "da_huy",
          NgayHuy: new Date(),
          LyDoHuy:
            req.user.role === "reader" ? "Độc giả hủy yêu cầu" : "Thủ thư hủy",
        },
        $unset: { NgayHenTraMoi: "" }, // Xóa ngày hẹn trả mới nếu có
      }
    );

    res.json({
      message:
        req.user.role === "reader"
          ? "Hủy yêu cầu mượn sách thành công!"
          : "Hủy phiếu mượn thành công!",
    });
  } catch (err) {
    console.error("❌ Lỗi hủy phiếu mượn:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

module.exports = router;
