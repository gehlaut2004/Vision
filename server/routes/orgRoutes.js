const express = require("express");
const router = express.Router();
const Org = require("../models/org");
const Student = require("../models/student");
const verifyOrg = require("../middleware/authMiddleware");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

// Setup multer for CSV upload
const upload = multer({ dest: "uploads/" });

// 🔐 Utility: Generate random string
function generateString(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// ────────────────────────────────────────────────
// ✅ POST /api/org/add-student → Add a new student
// ────────────────────────────────────────────────
router.post("/add-student", verifyOrg, async (req, res) => {
  const { name, enrollment } = req.body;

  if (!name?.trim() || !enrollment?.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Name and enrollment required" });
  }

  try {
    const existing = await Student.findOne({ enrollment });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Student already exists" });
    }

    const username = name.toLowerCase().split(" ")[0] + generateString(3);
    const password = generateString(8);

    const newStudent = new Student({
      name,
      enrollment,
      username,
      password,
      orgId: req.org.orgId,
    });

    await newStudent.save();

    res.status(201).json({
      success: true,
      message: "Student added",
      student: {
        name,
        enrollment,
        username,
        password,
      },
    });
  } catch (err) {
    console.error("Error adding student:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ────────────────────────────────────────────────
// ✅ GET /api/org/students → Get all students for org
// ────────────────────────────────────────────────
router.get("/students", verifyOrg, async (req, res) => {
  try {
    const students = await Student.find({ orgId: req.org.orgId }).select(
      "-__v -orgId"
    );

    res.json({
      success: true,
      students,
    });
  } catch (err) {
    console.error("Error fetching students:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch students" });
  }
});
// ────────────────────────────────────────────────
// ✅ GET /api/org/profile → Get current org profile
// ────────────────────────────────────────────────
router.get("/profile", verifyOrg, async (req, res) => {
  try {
    const org = await Org.findById(req.org.orgId).select("-password");
    if (!org) {
      return res.status(404).json({ success: false, message: "Org not found" });
    }

    res.json({ success: true, org });
  } catch (err) {
    console.error("Fetch org profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router.post("/upload-csv", verifyOrg, upload.single("file"), async (req, res) => {
  const results = [];

  if (!req.file) {
    return res.status(400).json({ success: false, message: "CSV file required." });
  }

  try {
    const filePath = path.join(__dirname, "..", req.file.path);

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        const studentsToInsert = [];

        for (const entry of results) {
          const { name, enrollment } = entry;

          if (!name?.trim() || !enrollment?.trim()) continue;

          const exists = await Student.findOne({ enrollment });
          if (exists) continue;

          const username = name.toLowerCase().split(" ")[0] + generateString(3);
          const password = generateString(8);

          studentsToInsert.push({
            name,
            enrollment,
            username,
            password,
            orgId: req.org.orgId,
          });
        }

        await Student.insertMany(studentsToInsert);

        fs.unlinkSync(filePath); // delete uploaded file
        res.status(201).json({
          success: true,
          message: `${studentsToInsert.length} students added.`,
          students: studentsToInsert,
        });
      });
  } catch (err) {
    console.error("CSV Upload Error:", err);
    res.status(500).json({ success: false, message: "Failed to upload CSV." });
  }
});
router.delete("/student/:id", verifyOrg, async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findOneAndDelete({
      _id: id,
      orgId: req.org.orgId,
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found or unauthorized" });
    }

    res.json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ success: false, message: "Server error during deletion" });
  }
});
router.post("/students/bulk-delete", verifyOrg, async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: "No student IDs provided" });
  }

  try {
    const result = await Student.deleteMany({
      _id: { $in: ids },
      orgId: req.org.orgId,
    });

    res.json({
      success: true,
      message: `${result.deletedCount} students deleted`,
    });
  } catch (err) {
    console.error("Bulk delete error:", err);
    res.status(500).json({ success: false, message: "Failed to delete students" });
  }
});
router.patch("/student/:id", verifyOrg, async (req, res) => {
  const { id } = req.params;
  const { name, password } = req.body;

  if (!name?.trim() || !password?.trim()) {
    return res.status(400).json({ success: false, message: "Name and password required" });
  }

  try {
    const student = await Student.findOneAndUpdate(
      { _id: id, orgId: req.org.orgId },
      { name, password },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found or unauthorized" });
    }

    res.json({ success: true, message: "Student updated", student });
  } catch (err) {
    console.error("Error updating student:", err);
    res.status(500).json({ success: false, message: "Server error during update" });
  }
});
router.get("/:examId/attempts-full", verifyOrg, async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findOne({
      _id: examId,
      orgId: req.org.orgId, // 🔐 Ensure this exam belongs to this org
    });

    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    const attempts = await Attempt.find({ examId }).lean();

    const detailedAttempts = attempts.map((a) => ({
      studentId: a.studentId,
      score: a.score,
      isAutoSubmitted: a.isAutoSubmitted || false,
      submittedAt: a.submittedAt || null,
      cheatingLogs: a.cheatingLogs || [],
    }));

    res.json({ success: true, attempts: detailedAttempts });
  } catch (err) {
    console.error("❌ Error fetching full attempts:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// 📍 GET /api/org/exams/:examId/report-csv
router.get("/:examId/report-csv", verifyOrg, async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findOne({
      _id: examId,
      orgId: req.org.orgId,
    });

    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    const attempts = await Attempt.find({ examId });

    const rows = [
      ["Student ID", "Score", "Auto Submitted", "Cheated", "Cheating Reasons"],
      ...attempts.map((a) => [
        a.studentId || "N/A",
        a.score,
        a.isAutoSubmitted ? "Yes" : "No",
        a.cheatingLogs?.length > 0 ? "Yes" : "No",
        a.cheatingLogs?.map((log) => log.reason).join("; ") || "None",
      ]),
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");

    res.setHeader("Content-disposition", "attachment; filename=exam_report.csv");
    res.set("Content-Type", "text/csv");
    res.status(200).send(csvContent);
  } catch (err) {
    console.error("❌ Error generating CSV report:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
