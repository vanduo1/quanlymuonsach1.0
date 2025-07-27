const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/login", require("./routes/login"));
// app.use("/api/login-vulnerable", require("./routes/login-vulnerable")); // Đã tắt endpoint login-vulnerable
app.use("/api/sach", require("./routes/sach"));
app.use("/api/docgia", require("./routes/docgia"));
app.use("/api/nhanvien", require("./routes/nhanvien"));
app.use("/api/nhaxuatban", require("./routes/nhaxuatban"));
app.use("/api/theodoimuonsach", require("./routes/theodoimuonsach"));
app.use("/api/datsach", require("./routes/datsach"));

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
