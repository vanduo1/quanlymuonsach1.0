const { client } = require("../config/db");
require("dotenv").config();

async function addMoreBooks() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");

    const db = client.db("quanlymuonsach");
    const sachCollection = db.collection("sachs");
    const nxbCollection = db.collection("nhaxuatbans");

    // Đảm bảo có nhà xuất bản
    const publishers = [
      {
        MaNXB: "NXB001",
        TenNXB: "NXB Trẻ",
        DiaChi: "161B Lý Chính Thắng, Q.3, TP.HCM",
        Email: "nxbtre@nxbtre.com.vn",
        SoDienThoai: "028-39316289",
      },
      {
        MaNXB: "NXB002",
        TenNXB: "NXB Kim Đồng",
        DiaChi: "55 Quang Trung, Hai Bà Trưng, Hà Nội",
        Email: "kimdong@nxbkimdong.com.vn",
        SoDienThoai: "024-39434730",
      },
      {
        MaNXB: "NXB003",
        TenNXB: "NXB Văn học",
        DiaChi: "18 Nguyễn Trường Tộ, Ba Đình, Hà Nội",
        Email: "vanhoc@nxbvanhoc.com.vn",
        SoDienThoai: "024-38222135",
      },
      {
        MaNXB: "NXB004",
        TenNXB: "NXB Phụ nữ",
        DiaChi: "39 Hàng Chuối, Hai Bà Trưng, Hà Nội",
        Email: "phunu@nxbphunu.com.vn",
        SoDienThoai: "024-39714477",
      },
      {
        MaNXB: "NXB005",
        TenNXB: "NXB Lao động",
        DiaChi: "175 Giảng Võ, Ba Đình, Hà Nội",
        Email: "laodong@nld.com.vn",
        SoDienThoai: "024-38515380",
      },
    ];

    // Thêm nhà xuất bản nếu chưa có
    for (const nxb of publishers) {
      const existing = await nxbCollection.findOne({ MaNXB: nxb.MaNXB });
      if (!existing) {
        await nxbCollection.insertOne(nxb);
        console.log(`✅ Thêm NXB: ${nxb.TenNXB}`);
      }
    }

    // Danh sách sách với các trường hợp số lượng khác nhau
    const newBooks = [
      // Sách có nhiều (> 10 cuốn)
      {
        MaSach: "BOOK004",
        TenSach: "Đắc Nhân Tâm",
        TacGia: "Dale Carnegie",
        TheLoai: "Kỹ năng sống",
        NamXuatBan: 2021,
        MaNXB: "NXB001",
        SoLuong: 25,
        SoLuongCon: 25,
        GiaSach: 120000,
        MoTa: "Cuốn sách nổi tiếng về nghệ thuật giao tiếp và ứng xử",
        HinhAnh: "dac-nhan-tam.jpg",
        SoLuotMuon: 0,
      },
      {
        MaSach: "BOOK005",
        TenSach: "Sapiens: Lược sử loài người",
        TacGia: "Yuval Noah Harari",
        TheLoai: "Lịch sử",
        NamXuatBan: 2020,
        MaNXB: "NXB003",
        SoLuong: 20,
        SoLuongCon: 18,
        GiaSach: 180000,
        MoTa: "Câu chuyện về sự tiến hóa của loài người từ thời tiền sử",
        HinhAnh: "sapiens.jpg",
        SoLuotMuon: 2,
      },
      {
        MaSach: "BOOK006",
        TenSach: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
        TacGia: "Nguyễn Nhật Ánh",
        TheLoai: "Tiểu thuyết",
        NamXuatBan: 2019,
        MaNXB: "NXB001",
        SoLuong: 30,
        SoLuongCon: 27,
        GiaSach: 95000,
        MoTa: "Tác phẩm văn học về tuổi thơ đầy cảm xúc",
        HinhAnh: "hoa-vang-co-xanh.jpg",
        SoLuotMuon: 3,
      },

      // Sách có ít (1-5 cuốn)
      {
        MaSach: "BOOK007",
        TenSach: "Muôn Kiếp Nhân Sinh",
        TacGia: "Nguyên Phong",
        TheLoai: "Tâm linh",
        NamXuatBan: 2020,
        MaNXB: "NXB004",
        SoLuong: 5,
        SoLuongCon: 3,
        GiaSach: 150000,
        MoTa: "Khám phá những bí ẩn về luân hồi và kiếp sống",
        HinhAnh: "muon-kiep-nhan-sinh.jpg",
        SoLuotMuon: 2,
      },
      {
        MaSach: "BOOK008",
        TenSach: "Atomic Habits",
        TacGia: "James Clear",
        TheLoai: "Phát triển bản thân",
        NamXuatBan: 2021,
        MaNXB: "NXB005",
        SoLuong: 4,
        SoLuongCon: 2,
        GiaSach: 160000,
        MoTa: "Hướng dẫn xây dựng thói quen tích cực",
        HinhAnh: "atomic-habits.jpg",
        SoLuotMuon: 2,
      },
      {
        MaSach: "BOOK009",
        TenSach: "Thinking, Fast and Slow",
        TacGia: "Daniel Kahneman",
        TheLoai: "Tâm lý học",
        NamXuatBan: 2020,
        MaNXB: "NXB003",
        SoLuong: 3,
        SoLuongCon: 1,
        GiaSach: 200000,
        MoTa: "Nghiên cứu về cách con người ra quyết định",
        HinhAnh: "thinking-fast-slow.jpg",
        SoLuotMuon: 2,
      },

      // Sách hết (0 cuốn)
      {
        MaSach: "BOOK010",
        TenSach: "Harry Potter và Hòn đá Phù thủy",
        TacGia: "J.K. Rowling",
        TheLoai: "Tiểu thuyết giả tưởng",
        NamXuatBan: 2019,
        MaNXB: "NXB001",
        SoLuong: 15,
        SoLuongCon: 0,
        GiaSach: 135000,
        MoTa: "Cuộc phiêu lưu đầu tiên của cậu bé phù thủy Harry Potter",
        HinhAnh: "harry-potter-1.jpg",
        SoLuotMuon: 15,
      },
      {
        MaSach: "BOOK011",
        TenSach: "The Alchemist",
        TacGia: "Paulo Coelho",
        TheLoai: "Văn học nước ngoài",
        NamXuatBan: 2018,
        MaNXB: "NXB003",
        SoLuong: 8,
        SoLuongCon: 0,
        GiaSach: 110000,
        MoTa: "Câu chuyện về hành trình tìm kiếm ước mơ",
        HinhAnh: "the-alchemist.jpg",
        SoLuotMuon: 8,
      },
      {
        MaSach: "BOOK012",
        TenSach: "Doraemon - Nobita và Hành tinh Màu tím",
        TacGia: "Fujiko F. Fujio",
        TheLoai: "Truyện tranh",
        NamXuatBan: 2021,
        MaNXB: "NXB002",
        SoLuong: 12,
        SoLuongCon: 0,
        GiaSach: 45000,
        MoTa: "Cuộc phiêu lưu mới của Doraemon và Nobita",
        HinhAnh: "doraemon-purple-planet.jpg",
        SoLuotMuon: 12,
      },

      // Sách vừa có (6-10 cuốn)
      {
        MaSach: "BOOK013",
        TenSach: "Café Cùng Tony",
        TacGia: "Tony Buổi Sáng",
        TheLoai: "Kinh doanh",
        NamXuatBan: 2020,
        MaNXB: "NXB005",
        SoLuong: 10,
        SoLuongCon: 7,
        GiaSach: 125000,
        MoTa: "Những chia sẻ về kinh doanh và cuộc sống",
        HinhAnh: "cafe-cung-tony.jpg",
        SoLuotMuon: 3,
      },
      {
        MaSach: "BOOK014",
        TenSach: "Tủ Sách CEO - Làm Chủ Cảm Xúc",
        TacGia: "Harvard Business Review",
        TheLoai: "Quản lý",
        NamXuatBan: 2021,
        MaNXB: "NXB005",
        SoLuong: 8,
        SoLuongCon: 6,
        GiaSach: 140000,
        MoTa: "Hướng dẫn quản lý cảm xúc trong công việc",
        HinhAnh: "lam-chu-cam-xuc.jpg",
        SoLuotMuon: 2,
      },
      {
        MaSach: "BOOK015",
        TenSach: "Tôi Là Bêtô",
        TacGia: "Nguyễn Nhật Ánh",
        TheLoai: "Thiếu nhi",
        NamXuatBan: 2020,
        MaNXB: "NXB001",
        SoLuong: 9,
        SoLuongCon: 8,
        GiaSach: 85000,
        MoTa: "Câu chuyện về tình bạn và tuổi thơ",
        HinhAnh: "toi-la-beto.jpg",
        SoLuotMuon: 1,
      },
    ];

    // Thêm sách vào database
    let addedCount = 0;
    let updatedCount = 0;

    for (const book of newBooks) {
      const existing = await sachCollection.findOne({ MaSach: book.MaSach });
      if (!existing) {
        await sachCollection.insertOne(book);
        addedCount++;
        console.log(
          `✅ Thêm sách mới: ${book.TenSach} (${book.SoLuongCon}/${book.SoLuong} cuốn)`
        );
      } else {
        await sachCollection.updateOne({ MaSach: book.MaSach }, { $set: book });
        updatedCount++;
        console.log(
          `🔄 Cập nhật sách: ${book.TenSach} (${book.SoLuongCon}/${book.SoLuong} cuốn)`
        );
      }
    }

    console.log("\n📊 THỐNG KÊ THÊM SÁCH:");
    console.log(`✅ Sách mới thêm: ${addedCount}`);
    console.log(`🔄 Sách được cập nhật: ${updatedCount}`);
    console.log(`📚 Tổng cộng: ${addedCount + updatedCount}`);

    // Thống kê số lượng theo trạng thái
    const allBooks = await sachCollection.find({}).toArray();
    const available = allBooks.filter((book) => book.SoLuongCon > 10);
    const limited = allBooks.filter(
      (book) => book.SoLuongCon >= 1 && book.SoLuongCon <= 10
    );
    const outOfStock = allBooks.filter((book) => book.SoLuongCon === 0);

    console.log("\n📈 THỐNG KÊ TRẠNG THÁI SÁCH:");
    console.log(`🟢 Sách có nhiều (>10 cuốn): ${available.length}`);
    console.log(`🟡 Sách có ít (1-10 cuốn): ${limited.length}`);
    console.log(`🔴 Sách hết (0 cuốn): ${outOfStock.length}`);
    console.log(`📖 Tổng số sách: ${allBooks.length}`);

    console.log("\n🎯 DANH SÁCH SÁCH HẾT:");
    outOfStock.forEach((book) => {
      console.log(`   📕 ${book.TenSach} - ${book.TacGia}`);
    });

    console.log("\n🟡 DANH SÁCH SÁCH CÒN ÍT:");
    limited
      .filter((book) => book.SoLuongCon <= 3)
      .forEach((book) => {
        console.log(`   📙 ${book.TenSach} - Còn: ${book.SoLuongCon} cuốn`);
      });

    console.log("\n✅ Hoàn thành thêm dữ liệu sách!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }
}

addMoreBooks();
