const express = require("express");
const router = express.Router();
const Org = require("../models/org");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// Update Org Name
router.put("/name", async (req, res) => {
  try {
    const { orgId, newName } = req.body;
    const org = await Org.findByIdAndUpdate(orgId, { orgName: newName }, { new: true });
    res.json({ message: "Org name updated", orgName: org.orgName });
  } catch (err) {
    console.error("❌ Failed to update name:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Change Password
router.put("/password", async (req, res) => {
  try {
    const { orgId, oldPassword, newPassword } = req.body;
    const org = await Org.findById(orgId);

    const match = await bcrypt.compare(oldPassword, org.password);
    if (!match) return res.status(400).json({ error: "Incorrect old password" });

    const hashed = await bcrypt.hash(newPassword, 10);
    org.password = hashed;
    await org.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Failed to update password:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Send OTP to new email
router.post("/email/send-otp", async (req, res) => {
  try {
    const { orgId, newEmail } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ORG_EMAIL,
        pass: process.env.ORG_EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.ORG_EMAIL,
      to: newEmail,
      subject: "Email Verification OTP",
      html: `<h2>Your OTP is: ${otp}</h2>`,
    });

    await Org.findByIdAndUpdate(orgId, {
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000, // 10 min
    });

    res.json({ message: "OTP sent to new email" });
  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Verify OTP and update email
router.put("/email/verify", async (req, res) => {
  try {
    const { orgId, newEmail, otp } = req.body;
    const org = await Org.findById(orgId);

    if (!org || org.otp !== otp || Date.now() > org.otpExpiry) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    org.email = newEmail;
    org.otp = null;
    org.otpExpiry = null;
    org.isVerified = true;

    await org.save();
    res.json({ message: "Email updated successfully" });
  } catch (err) {
    console.error("❌ Error verifying OTP:", err);
    res.status(500).json({ error: "Failed to update email" });
  }
});

module.exports = router;
