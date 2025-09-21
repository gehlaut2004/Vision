const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Attempt = require("../models/Attempt");
const Student = require("../models/student");
const verifyStudent = require("../middleware/verifyStudent");

// @route   GET /api/stu/leaderboard
// @desc    Get top 10 students by average and highest score (org-specific)
// @access  Private (Student)
router.get("/leaderboard", verifyStudent, async (req, res) => {
  try {
    // 🔄 Get student from DB to extract orgId
    const student = await Student.findById(req.studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const orgId = student.orgId;

    const allAttempts = await Attempt.aggregate([
      {
        $match: {
          orgId: new mongoose.Types.ObjectId(orgId),
        },
      },
      {
        $group: {
          _id: "$studentId",
          averageScore: { $avg: "$score" },
          highestScore: { $max: "$score" },
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $project: {
          _id: 0,
          studentId: "$student._id",
          name: "$student.name",
          averageScore: { $round: ["$averageScore", 2] },
          highestScore: 1,
        },
      },
    ]);

    const topAverage = [...allAttempts]
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10);

    const topHigh = [...allAttempts]
      .sort((a, b) => b.highestScore - a.highestScore)
      .slice(0, 10);

    res.json({
      success: true,
      averageTop10: topAverage,
      highestTop10: topHigh,
    });
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
