const { client } = require("../config/db");
require("dotenv").config();

async function addMaSachToBooks() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");

    const db = client.db("quanlymuonsach");
    const sachCollection = db.collection("sachs");

    const books = await sachCollection.find({}).toArray();
    console.log(`Found ${books.length} books to update`);

    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      if (!book.MaSach) {
        const MaSach = `BOOK${String(i + 1).padStart(3, "0")}`;
        await sachCollection.updateOne(
          { _id: book._id },
          {
            $set: {
              MaSach: MaSach,
              SoLuongCon: book.SoLuong || 0,
            },
          }
        );
        console.log(`Updated book: ${book.TenSach} -> MaSach: ${MaSach}`);
      }
    }

    console.log("✅ All books updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

addMaSachToBooks();
