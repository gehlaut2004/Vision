const Attempt = require("../models/Attempt");
const Student = require("../models/student");

const getLeaderboard = async (req, res) => {
  try {
    const aggregation = await Attempt.aggregate([
      {
        $group: {
          _id: "$studentId",
          avgScore: { $avg: "$score" },
          highestScore: { $max: "$score" },
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      {
        $unwind: "$studentInfo",
      },
      {
        $project: {
          _id: 1,
          avgScore: { $round: ["$avgScore", 0] },
          highestScore: 1,
          name: "$studentInfo.name",
        },
      },
    ]);

    res.status(200).json({ success: true, leaderboard: aggregation });
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { getLeaderboard };
