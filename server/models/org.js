const mongoose = require("mongoose");

const orgSchema = new mongoose.Schema({
  orgName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  otp: {
    code: String,
    expiresAt: Date,
  },
  updatedEmail: {
    type: String, 
  }
});

module.exports = mongoose.model("Org", orgSchema);
