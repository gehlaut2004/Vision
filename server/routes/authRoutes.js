const express = require("express");
const jwt = require("jsonwebtoken");
const Org = require("../models/org");
const { sendOTP } = require("../utils/sendMail");

const router = express.Router();

const otps = new Map(); // email → { otp, expires }

// ─── Utility: Generate random 6-digit OTP ─────────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

// ─── STEP 1: Request OTP ─────────────────────────────────────────────
router.post("/request-otp", async (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) {
    return res.status(400).json({ success: false, message: "Email required" });
  }

  const otp = generateOTP();
  otps.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });

  try {
    await sendOTP(email, otp);
    res.json({ success: true, message: "OTP sent to email." });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP." });
  }
});

// ─── STEP 2: Verify OTP ─────────────────────────────────────────────
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const data = otps.get(email);

  if (!data || Date.now() > data.expires) {
    return res.status(400).json({ success: false, message: "OTP expired." });
  }

  if (data.otp !== parseInt(otp)) {
    return res.status(400).json({ success: false, message: "Invalid OTP." });
  }

  otps.delete(email);
  res.json({ success: true, message: "OTP verified. You can proceed." });
});

// ─── STEP 3: Register Organization ─────────────────────────────
router.post("/register", async (req, res) => {
  const { orgName, email, password } = req.body;

  if (!orgName?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const existingOrg = await Org.findOne({ email });
    if (existingOrg) {
      return res.status(400).json({ success: false, message: "Org already exists" });
    }

    const org = new Org({ orgName, email, password, isVerified: true });
    await org.save();

    res.json({ success: true, message: "Org registered successfully." });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: "Server error during registration." });
  }
});

// ─── STEP 4: Login with JWT ─────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ success: false, message: "Email and password required" });
  }

  try {
    const org = await Org.findOne({ email });

    if (!org || org.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { orgId: org._id, email: org.email },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      org: {
        _id: org._id,
        orgName: org.orgName,
        email: org.email,
        isVerified: org.isVerified,
        students: org.students,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
});

module.exports = router;
