import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentDashboardHome() {
  const [examDates, setExamDates] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [leaderboard, setLeaderboard] = useState({
    averageTop10: [],
    highestTop10: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("studentToken");

        const examsRes = await axios.get(
          "http://localhost:5000/api/student/exams/upcoming",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (examsRes.data.success) {
          const dates = examsRes.data.exams.map((exam) => ({
            date: new Date(exam.startTime),
            id: exam._id,
            title: exam.title,
            duration: exam.duration,
          }));
          setExamDates(dates);
        }

        const attemptsRes = await axios.get(
          "http://localhost:5000/api/student/attempts",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (attemptsRes.data.success) {
          const chartData = attemptsRes.data.attempts.map((a) => ({
            name: a.examId?.title || "Untitled",
            score: a.score,
          }));
          setAttempts(chartData);
        }

        const leaderboardRes = await axios.get(
          "http://localhost:5000/api/stu/leaderboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (leaderboardRes.data.success) {
          setLeaderboard({
            averageTop10: leaderboardRes.data.averageTop10 || [],
            highestTop10: leaderboardRes.data.highestTop10 || [],
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setExamDates((prev) => [...prev]); // force re-render
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const getExamsOnDate = (date) => {
    return examDates.filter(
      (exam) => exam.date.toDateString() === date.toDateString()
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    const hasExam = examDates.some(
      (exam) => date.toDateString() === exam.date.toDateString()
    );
    return hasExam ? "bg-purple-500/20 text-white font-semibold" : null;
  };

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* 📊 Student Performance */}
      <div>
        <h2 className="text-2xl font-bold text-cyan-300 font-mono mb-4">
          📊 Student Performance Overview
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-cyan-900/30 border border-cyan-400/30 rounded-lg p-4 text-center">
            <p className="text-sm text-cyan-100 font-mono">Total Attempts</p>
            <p className="text-2xl font-bold text-cyan-300">
              {attempts.length}
            </p>
          </div>
          <div className="bg-cyan-900/30 border border-cyan-400/30 rounded-lg p-4 text-center">
            <p className="text-sm text-cyan-100 font-mono">Average Score</p>
            <p className="text-2xl font-bold text-cyan-300">
              {attempts.length > 0
                ? Math.round(
                    attempts.reduce((sum, a) => sum + a.score, 0) /
                      attempts.length
                  )
                : 0}
            </p>
          </div>
          <div className="bg-cyan-900/30 border border-cyan-400/30 rounded-lg p-4 text-center">
            <p className="text-sm text-cyan-100 font-mono">Best Score</p>
            <p className="text-2xl font-bold text-green-400">
              {attempts.length > 0
                ? Math.max(...attempts.map((a) => a.score))
                : 0}
            </p>
          </div>
          <div className="bg-cyan-900/30 border border-cyan-400/30 rounded-lg p-4 text-center">
            <p className="text-sm text-cyan-100 font-mono">Lowest Score</p>
            <p className="text-2xl font-bold text-red-400">
              {attempts.length > 0
                ? Math.min(...attempts.map((a) => a.score))
                : 0}
            </p>
          </div>
        </div>

        <div className="w-full h-72 bg-gray-800 border border-cyan-600/20 rounded-lg p-4">
          {attempts.length === 0 ? (
            <p className="text-center text-cyan-400 font-mono">
              No attempts yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attempts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" tick={{ fill: "#ccc", fontSize: 12 }} />
                <YAxis tick={{ fill: "#ccc", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    borderColor: "#7e22ce",
                    borderRadius: "0.5rem",
                    color: "#e2e8f0",
                  }}
                />
                <Bar dataKey="score" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 📅 Exam Calendar */}
      <div>
        <h2 className="text-2xl font-bold text-purple-300 font-mono mb-4">
          📅 Exam Calendar
        </h2>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-[30%]">
            <div className="bg-gray-800/90 border border-purple-500/50 rounded-xl p-4 backdrop-blur-sm">
              <Calendar
                className="!bg-transparent !border-none font-mono"
                navigationLabel={({ date }) => (
                  <span className="text-purple-300">
                    {date.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
                tileContent={({ date, view }) => {
                  if (view === "month") {
                    const match = examDates.find(
                      (exam) => date.toDateString() === exam.date.toDateString()
                    );
                    return match ? (
                      <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                        <span className="text-xs bg-purple-600/80 text-white px-1 rounded">
                          📌
                        </span>
                      </div>
                    ) : null;
                  }
                }}
                onClickDay={(date) => setSelectedDate(date)}
                tileClassName={tileClassName}
                formatShortWeekday={(locale, date) =>
                  ["S", "M", "T", "W", "T", "F", "S"][date.getDay()]
                }
                prev2Label={null}
                next2Label={null}
                minDetail="year"
                view="month"
              />
            </div>
          </div>

          <div className="w-full md:w-[30%] min-h-[400px]">
            <AnimatePresence mode="wait">
              {selectedDate ? (
                <motion.div
                  key={selectedDate.toString()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gray-900/90 text-sm text-purple-200 border border-purple-500/40 rounded-xl p-4 shadow-lg h-full"
                >
                  <p className="font-bold text-purple-300 mb-2 border-b border-purple-500/30 pb-1">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {getExamsOnDate(selectedDate).length > 0 ? (
                    <ul className="space-y-2">
                      {getExamsOnDate(selectedDate).map((exam, idx) => {
                        const now = new Date();
                        const examStart = new Date(exam.date);
                        const diffInMs = examStart - now;
                        const diffInMinutes = diffInMs / (1000 * 60);
                        const canJoin = Math.abs(diffInMinutes) <= 10;

                        const getCountdown = () => {
                          if (diffInMs <= 0) return "Started";
                          const totalSeconds = Math.floor(diffInMs / 1000);
                          const hours = Math.floor(totalSeconds / 3600);
                          const minutes = Math.floor(
                            (totalSeconds % 3600) / 60
                          );
                          const seconds = totalSeconds % 60;

                          const pad = (n) => String(n).padStart(2, "0");
                          return `${pad(hours)}:${pad(minutes)}:${pad(
                            seconds
                          )}`;
                        };

                        return (
                          <li
                            key={idx}
                            className="flex flex-col mb-2 border-b border-purple-700/30 pb-2"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex gap-2">
                                <span className="text-purple-400 mt-1">•</span>
                                <div>
                                  <p className="text-purple-100 font-semibold">
                                    {exam.title}
                                  </p>
                                  <p className="text-purple-400 text-xs">
                                    {exam.date.toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}{" "}
                                    — Duration: {exam.duration || "?"} mins
                                  </p>
                                  <p className="text-xs text-yellow-400 mt-1 font-mono">
                                    ⏳ {getCountdown()}
                                  </p>
                                </div>
                              </div>

                              <button
                                disabled={!canJoin}
                                onClick={() =>
                                  (window.location.href = `/student/exam/${exam.id}`)
                                }
                                className={`${
                                  canJoin
                                    ? "bg-purple-600 hover:bg-purple-700 cursor-pointer"
                                    : "bg-gray-700 cursor-not-allowed"
                                } text-white text-xs px-3 py-1 rounded-md ml-2`}
                              >
                                {canJoin ? "Join" : "Locked"}
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-purple-400 italic">
                      No exams scheduled on this day.
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gray-900/50 text-sm text-purple-400 border border-dashed border-purple-500/20 rounded-xl p-4 shadow-lg h-full flex items-center justify-center"
                >
                  <p>Select a date to view scheduled exams</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 🏆 Leaderboards */}
      <div>
        <h2 className="text-2xl font-bold text-yellow-300 font-mono mb-4">
          🏆 Leaderboards
        </h2>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2 bg-gray-800 border border-yellow-500/30 rounded-xl overflow-auto max-h-[400px]">
            <h3 className="text-lg font-semibold text-yellow-200 px-4 pt-4 pb-2">
              Average Score (Top 10)
            </h3>
            {leaderboard.averageTop10.length === 0 ? (
              <p className="text-center text-yellow-400 font-mono p-4">
                Leaderboard data not available.
              </p>
            ) : (
              <table className="w-full text-left font-mono text-sm text-yellow-100">
                <thead className="bg-yellow-700/20 text-yellow-300 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.averageTop10.map((student, index) => (
                    <tr
                      key={student.studentId + "_avg"}
                      className={`border-t border-yellow-500/10 hover:bg-yellow-600/10 ${
                        index === 0 ? "bg-yellow-800/20" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-yellow-200">
                        {index === 0
                          ? "🥇"
                          : index === 1
                          ? "🥈"
                          : index === 2
                          ? "🥉"
                          : `#${index + 1}`}
                      </td>
                      <td className="py-3 px-4">{student.name}</td>
                      <td className="py-3 px-4">{student.averageScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="w-full md:w-1/2 bg-gray-800 border border-yellow-500/30 rounded-xl overflow-auto max-h-[400px]">
            <h3 className="text-lg font-semibold text-yellow-200 px-4 pt-4 pb-2">
              Highest Score (Top 10)
            </h3>
            {leaderboard.highestTop10.length === 0 ? (
              <p className="text-center text-yellow-400 font-mono p-4">
                Leaderboard data not available.
              </p>
            ) : (
              <table className="w-full text-left font-mono text-sm text-yellow-100">
                <thead className="bg-yellow-700/20 text-yellow-300 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">High Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.highestTop10.map((student, index) => (
                    <tr
                      key={student.studentId + "_high"}
                      className={`border-t border-yellow-500/10 hover:bg-yellow-600/10 ${
                        index === 0 ? "bg-yellow-800/20" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-yellow-200">
                        {index === 0
                          ? "🥇"
                          : index === 1
                          ? "🥈"
                          : index === 2
                          ? "🥉"
                          : `#${index + 1}`}
                      </td>
                      <td className="py-3 px-4">{student.name}</td>
                      <td className="py-3 px-4">{student.highestScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
