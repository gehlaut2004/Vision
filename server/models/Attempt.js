const mongoose = require("mongoose");

const AttemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Org", // 🔥 Add this field
    required: true,
  },
  answers: [Number],
  score: Number,
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  isAutoSubmitted: { type: Boolean, default: false },
  cheatingLogs: [
    {
      reason: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Attempt", AttemptSchema);
