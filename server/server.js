// server.js (very top)
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes");
const orgRoutes = require("./routes/orgRoutes");
const orgExamRoutes = require("./routes/orgExamRoutes");
const orgSettingsRoutes = require("./routes/orgSettingsRoutes");
const studentAuthRoutes = require("./routes/studentAuth");
const attemptRoutes = require("./routes/attempts");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/org/exams", orgExamRoutes);
app.use("/api/org/settings", orgSettingsRoutes);
app.use("/api/student", studentAuthRoutes);
app.use("/api/student/attempts", attemptRoutes);
app.use("/api/stu", studentRoutes);
app.use("/api/student/exams", require("./routes/exam"));

// ✅ PORT
const PORT = process.env.PORT || 5000;

// ✅ MongoDB Connect (no deprecated options, clean URI)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });
