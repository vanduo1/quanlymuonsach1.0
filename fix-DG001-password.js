const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = "quanlymuonsach";

async function fixDG001Password() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("MongoDB connected successfully!");

    const db = client.db(DB_NAME);
    const docGiaCollection = db.collection("docgias");

    // Check current DG001 user
    const currentUser = await docGiaCollection.findOne({ MaDocGia: "DG001" });
    if (!currentUser) {
      console.log("❌ DG001 user not found!");
      return;
    }

    console.log("📋 Current DG001 user:");
    console.log("   MaDocGia:", currentUser.MaDocGia);
    console.log("   HoTen:", currentUser.HoTen);
    console.log("   Current password (hashed):", currentUser.MatKhau);

    // Option 1: Set plain text password "123456" for vulnerable endpoint
    console.log(
      "\n🔧 Setting password to plain text '123456' for vulnerable endpoint..."
    );
    await docGiaCollection.updateOne(
      { MaDocGia: "DG001" },
      { $set: { MatKhau: "123456" } }
    );

    // Verify the update
    const updatedUser = await docGiaCollection.findOne({ MaDocGia: "DG001" });
    console.log("✅ Password updated successfully!");
    console.log("   New password:", updatedUser.MatKhau);

    console.log("\n💡 Now you can login with:");
    console.log("   MaDocGia: DG001");
    console.log("   MatKhau: 123456");
    console.log("   (using the vulnerable login endpoint)");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("\n📊 Database connection closed.");
  }
}

fixDG001Password();
