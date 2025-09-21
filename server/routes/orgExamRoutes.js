const express = require("express");
const router = express.Router();
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const Exam = require("../models/Exam");
const Attempt = require("../models/Attempt");
const verifyOrg = require("../middleware/authMiddleware"); // ✅ Middleware

const upload = multer({ dest: "uploads/" });

// 📍 POST /api/org/exams/create
router.post(
  "/create",
  verifyOrg,
  upload.single("csvFile"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        startTime,
        duration,
        allowTabSwitching,
        requireCameraMic,
        questions,
      } = req.body;

      const parsedStartTime = new Date(startTime);
      const parsedDuration = parseInt(duration);
      const parsedAllowTabSwitching = allowTabSwitching === "true";
      const parsedRequireCameraMic = requireCameraMic === "true";

      let parsedQuestions = [];

      if (req.file) {
        const filePath = path.join(__dirname, "..", req.file.path);
        const rows = [];

        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (data) => rows.push(data))
          .on("end", async () => {
            parsedQuestions = rows.map((row) => ({
              question: row.question,
              options: [row.option1, row.option2, row.option3, row.option4],
              correctOption: isNaN(parseInt(row.correctOption))
                ? -1
                : parseInt(row.correctOption),
            }));

            fs.unlinkSync(filePath);

            const exam = new Exam({
              title,
              description,
              startTime: parsedStartTime,
              duration: parsedDuration,
              allowTabSwitching: parsedAllowTabSwitching,
              requireCameraMic: parsedRequireCameraMic,
              questions: parsedQuestions,
              orgId: req.org.orgId, // ✅ Store orgId
            });

            await exam.save();
            res.status(201).json({ message: "Exam created with CSV", exam });
          });
      } else {
        parsedQuestions = questions ? JSON.parse(questions) : [];

        const exam = new Exam({
          title,
          description,
          startTime: parsedStartTime,
          duration: parsedDuration,
          allowTabSwitching: parsedAllowTabSwitching,
          requireCameraMic: parsedRequireCameraMic,
          questions: parsedQuestions,
          orgId: req.org.orgId, // ✅ Store orgId
        });

        await exam.save();
        res.status(201).json({ message: "Exam created", exam });
      }
    } catch (err) {
      console.error("❌ Error creating exam:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// 📍 GET /api/org/exams/recent
router.get("/recent", verifyOrg, async (req, res) => {
  try {
    const now = new Date();
    const recentExams = await Exam.find({
      startTime: { $lt: now },
      orgId: req.org.orgId, // ✅ Filter by orgId
    })
      .sort({ startTime: -1 })
      .limit(5)
      .lean();

    const withAttempts = await Promise.all(
      recentExams.map(async (exam) => {
        const attempts = await Attempt.find({ examId: exam._id });
        const totalAttempts = attempts.length;
        const avgScore =
          totalAttempts === 0
            ? 0
            : (
                attempts.reduce((acc, a) => acc + a.score, 0) / totalAttempts
              ).toFixed(2);

        return { ...exam, totalAttempts, avgScore, attempts };
      })
    );

    res.json(withAttempts);
  } catch (err) {
    console.error("❌ Error fetching recent exams:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📍 GET /api/org/exams/live
router.get("/live", verifyOrg, async (req, res) => {
  try {
    const now = new Date();
    const liveExams = await Exam.find({
      orgId: req.org.orgId, // ✅
      startTime: { $lte: now },
      $expr: {
        $gt: [
          { $add: ["$startTime", { $multiply: ["$duration", 60000] }] },
          now,
        ],
      },
    });
    res.json(liveExams);
  } catch (err) {
    console.error("❌ Failed to fetch live exams:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📍 GET /api/org/exams/upcoming
router.get("/upcoming", verifyOrg, async (req, res) => {
  try {
    const now = new Date();
    const upcoming = await Exam.find({
      orgId: req.org.orgId, // ✅
      startTime: { $gt: now },
    })
      .sort({ startTime: 1 })
      .limit(5);
    res.json(upcoming);
  } catch (err) {
    console.error("❌ Error fetching upcoming exams:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📍 PUT /api/org/exams/:id
router.put("/:id", verifyOrg, async (req, res) => {
  try {
    const examId = req.params.id;
    const updates = req.body;

    const updated = await Exam.findOneAndUpdate(
      { _id: examId, orgId: req.org.orgId }, // ✅ Ensure exam belongs to org
      updates,
      { new: true }
    );

    if (!updated) return res.status(403).json({ error: "Unauthorized" });

    res.json(updated);
  } catch (err) {
    console.error("❌ Failed to update exam:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📍 DELETE /api/org/exams/:id
router.delete("/:id", verifyOrg, async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({
      _id: req.params.id,
      orgId: req.org.orgId, // ✅ Ensure ownership
    });

    if (!exam) return res.status(403).json({ error: "Unauthorized" });

    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting exam:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📍 GET /api/org/exams/:examId/report
router.get("/:examId/report", verifyOrg, async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findOne({ _id: examId, orgId: req.org.orgId }); // ✅

    if (!exam) return res.status(404).json({ error: "Exam not found" });

    const attempts = await Attempt.find({ examId });

    const rows = [
      ["Student ID", "Score", "Cheating Detected?"],
      ...attempts.map((a) => [
        a.studentId || "N/A",
        a.score,
        a.cheated ? "Yes" : "No",
      ]),
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");

    res.setHeader(
      "Content-disposition",
      "attachment; filename=exam_report.csv"
    );
    res.set("Content-Type", "text/csv");
    res.status(200).send(csvContent);
  } catch (err) {
    console.error("❌ Error generating report:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📍 GET /api/org/exams/:examId/attempts
router.get("/:examId/attempts", verifyOrg, async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findOne({ _id: examId, orgId: req.org.orgId }); // ✅

    if (!exam) return res.status(404).json({ error: "Unauthorized" });

    const attempts = await Attempt.find({ examId });
    res.json(attempts);
  } catch (err) {
    console.error("❌ Error fetching attempts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📍 GET /api/org/exams/:id
router.get("/:id", verifyOrg, async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,
      orgId: req.org.orgId, // ✅
    }).lean();

    if (!exam) return res.status(404).json({ error: "Not found" });

    const attempts = await Attempt.find({ examId: exam._id }).lean();
    res.json({ ...exam, attempts });
  } catch (err) {
    console.error("❌ Error fetching exam report:", err);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/:examId/attempts-full", verifyOrg, async (req, res) => {
  try {
    const { examId } = req.params;

    const attempts = await Attempt.find({ examId, orgId: req.org.orgId })
      .populate("studentId", "name enrollment") // ✅ fixed spelling
      .sort({ submittedAt: -1 });

    const formatted = attempts.map((a) => ({
      studentName: a.studentId?.name || "Unknown",
      enrolment: a.studentId?.enrollment || "-",
      score: a.score,
      cheated: a.cheatingLogs?.length > 0, // ✔️
      isAutoSubmitted: a.isAutoSubmitted, // ✔️
      submittedAt: a.submittedAt,
      cheatingLogs: a.cheatingLogs || [], // ✔️
    }));

    res.json({ success: true, attempts: formatted });
  } catch (err) {
    console.error("Error fetching full attempts:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:examId/report-csv", verifyOrg, async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findOne({ _id: examId, orgId: req.org.orgId });
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    const attempts = await Attempt.find({
      examId,
      orgId: req.org.orgId,
    }).populate("studentId", "name enrollment"); // ✅ fetch enrolment instead of email

    const rows = [
      ["Student Name", "Enrollment", "Score", "Cheated", "Submitted At"],
      ...attempts.map((a) => [
        a.studentId?.name || "Unknown",
        a.studentId?.enrolment || "-",
        a.score,
        a.cheated ? "Yes" : "No",
        a.submittedAt.toISOString(),
      ]),
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");

    res.setHeader(
      "Content-disposition",
      "attachment; filename=exam_report.csv"
    );
    res.set("Content-Type", "text/csv");
    res.status(200).send(csvContent);
  } catch (err) {
    console.error("❌ Error generating report-csv:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/start-now/:id", verifyOrg, async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, orgId: req.org.orgId });
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    const now = new Date();
    const endTime = new Date(now.getTime() + exam.duration * 60000); // Add minutes

    exam.startTime = now;
    exam.endTime = endTime;
    await exam.save();

    res.json({ message: "Exam started successfully" });
  } catch (err) {
    console.error("Start-now failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
