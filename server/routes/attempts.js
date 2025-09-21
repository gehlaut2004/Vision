const express = require("express");
const router = express.Router();
const Attempt = require("../models/Attempt");
const Exam = require("../models/Exam");
const verifyStudent = require("../middleware/verifyStudent");

// GET /api/student/attempts
router.get("/", verifyStudent, async (req, res) => {
  try {
    const attempts = await Attempt.find({ studentId: req.studentId })
      .populate("examId", "title date")
      .sort({ submittedAt: -1 });

    res.json({ success: true, attempts });
  } catch (err) {
    console.error("Error fetching student attempts:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ POST /api/student/attempts/:examId
router.post("/:examId", verifyStudent, async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers = [], isAutoSubmitted = false, cheatingLogs = [] } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    // ✅ Score calculation
    let score = 0;
    exam.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctOption) score++;
    });

    const attempt = new Attempt({
      examId,
      orgId: exam.orgId, // from Exam model
      studentId: req.studentId,
      answers,
      score,
      submittedAt: new Date(),
      isAutoSubmitted,
      cheatingLogs,
    });

    await attempt.save();

    res.json({ success: true, message: "Attempt saved", score });
  } catch (err) {
    console.error("Error submitting attempt:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
