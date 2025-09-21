const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const Exam = require("../models/Exam");
const Attempt = require("../models/Attempt"); // 🔍 you missed importing this

// 📍 GET /api/student/exams/upcoming
router.get("/upcoming", verifyStudent, async (req, res) => {
  try {
    const now = new Date();

    const exams = await Exam.find({
      orgId: req.orgId,
      startTime: { $gte: now },
    }).sort({ startTime: 1 });

    res.json({ success: true, exams });
  } catch (err) {
    console.error("Error fetching upcoming exams:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📍 GET /api/student/exams/available (live exams not yet attempted)
router.get("/available", verifyStudent, async (req, res) => {
  try {
    const now = new Date();
    const attempted = await Attempt.find({ studentId: req.studentId }).distinct("examId");

    const exams = await Exam.find({
      orgId: req.orgId,
      startTime: { $lte: now },
      $expr: {
        $gt: [
          { $add: ["$startTime", { $multiply: ["$duration", 60000] }] },
          now,
        ],
      },
      _id: { $nin: attempted },
    }).sort({ startTime: 1 });

    res.json({ success: true, exams });
  } catch (err) {
    console.error("❌ Error fetching available exams:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📍 GET /api/student/exams/live
router.get("/live", verifyStudent, async (req, res) => {
  try {
    const now = new Date();
    const exams = await Exam.find({
      orgId: req.orgId,
      startTime: { $lte: now },
      $expr: {
        $gt: [
          { $add: ["$startTime", { $multiply: ["$duration", 60000] }] },
          now,
        ],
      },
    }).sort({ startTime: 1 });

    res.json({ success: true, exams });
  } catch (err) {
    console.error("❌ Error fetching live student exams:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📍 GET /api/student/exams/:examId — must be last
router.get("/:examId", verifyStudent, async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findOne({
      _id: examId,
      orgId: req.orgId,
    });

    if (!exam)
      return res.status(404).json({ success: false, message: "Exam not found" });

    res.json({ success: true, exam });
  } catch (err) {
    console.error("❌ Error fetching exam:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
