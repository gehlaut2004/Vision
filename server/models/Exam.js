const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctOption: Number,
});

const examSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org", required: true }, // 👈 add this
  title: { type: String, required: true },
  description: String,
  startTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  allowTabSwitching: { type: Boolean, default: false },
  requireCameraMic: { type: Boolean, default: false },
  questions: [questionSchema],
});

module.exports = mongoose.model("Exam", examSchema);
