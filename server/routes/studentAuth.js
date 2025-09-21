const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Student = require("../models/student");

// @route   POST /api/student/login
// @desc    Student login (plain password)
// @access  Public
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const student = await Student.findOne({ username });

    if (!student || student.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // ✅ JWT now includes orgId, studentId, name, username, enrollment
    const token = jwt.sign(
      {
        studentId: student._id,
        orgId: student.orgId,
        name: student.name,
        username: student.username,
        enrollment: student.enrollment,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      student: {
        _id: student._id,
        name: student.name,
        username: student.username,
        enrollment: student.enrollment,
        orgId: student.orgId,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;
