import { useEffect, useState } from "react";
import axios from "axios";
import OrgSidebar from "./OrgSidebar";
import OrgHeader from "./OrgHeader";

export default function OrgDashboard() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const token = localStorage.getItem("orgToken");
    const res = await axios.get("http://localhost:5000/api/org/exams/recent", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExams(res.data || []);
  };

  const fetchAttempts = async (examId) => {
    const token = localStorage.getItem("orgToken");

    if (selectedExam === examId) {
      // Toggle off
      setSelectedExam(null);
      setAttempts([]);
      return;
    }

    const res = await axios.get(
      `http://localhost:5000/api/org/exams/${examId}/attempts-full`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setSelectedExam(examId);
    setAttempts(res.data.attempts || []);
  };

  const deleteExam = async (examId) => {
    const confirm = window.confirm("Are you sure you want to delete this exam?");
    if (!confirm) return;

    const token = localStorage.getItem("orgToken");

    try {
      await axios.delete(`http://localhost:5000/api/org/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setExams((prev) => prev.filter((e) => e._id !== examId));
      if (selectedExam === examId) {
        setSelectedExam(null);
        setAttempts([]);
      }
    } catch (err) {
      console.error("❌ Failed to delete exam:", err);
      alert(err?.response?.data?.error || "Failed to delete exam.");
    }
  };

  const downloadCSV = async () => {
    const token = localStorage.getItem("orgToken");
    try {
      const res = await axios.get(
        `http://localhost:5000/api/org/exams/${selectedExam}/report-csv`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "exam_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Failed to download CSV:", err);
      alert("Download failed.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-800 overflow-hidden">
      <OrgSidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <OrgHeader orgName="CodeAcademy" />
        <main className="flex-1 p-6 text-white font-mono">
          <h2 className="text-2xl font-bold mb-6 text-cyan-300">
            📊 Dashboard Overview
          </h2>

          {/* 🎴 Exam Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {exams.map((exam) => (
              <div
                key={exam._id}
                className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow hover:shadow-lg transition duration-200"
              >
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">{exam.title}</h3>
                <p className="text-sm text-gray-400 mb-4">
                  📅 {new Date(exam.date || Date.now()).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchAttempts(exam._id)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded-md text-sm"
                  >
                    {selectedExam === exam._id ? "Close" : "View"}
                  </button>
                  <button
                    onClick={() => deleteExam(exam._id)}
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 📥 Download CSV */}
          {selectedExam && (
            <button
              onClick={downloadCSV}
              className="inline-block mb-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded shadow"
            >
              📥 Download CSV Report
            </button>
          )}

          {/* 📄 Attempts Table */}
          {attempts.length > 0 ? (
            <div className="overflow-x-auto border border-cyan-700 rounded-lg shadow mt-2">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-cyan-900 text-cyan-200 uppercase tracking-wide">
                  <tr>
                    <th className="py-2 px-4 border">Student Name</th>
                    <th className="py-2 px-4 border">Enrolment</th>
                    <th className="py-2 px-4 border">Score</th>
                    <th className="py-2 px-4 border">Auto Submitted</th>
                    <th className="py-2 px-4 border">Cheating?</th>
                    <th className="py-2 px-4 border">Cheating Logs</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a, i) => (
                    <tr
                      key={i}
                      className={`${
                        a.cheatingLogs?.length > 0 || a.isAutoSubmitted
                          ? "bg-red-900/30"
                          : "bg-gray-900"
                      } hover:bg-cyan-800/20`}
                    >
                      <td className="py-2 px-4 border">{a.studentName}</td>
                      <td className="py-2 px-4 border">{a.enrolment}</td>
                      <td className="py-2 px-4 border">{a.score}</td>
                      <td className="py-2 px-4 border">
                        {a.isAutoSubmitted ? "✅ Yes" : "—"}
                      </td>
                      <td className="py-2 px-4 border">
                        {a.cheated ? "⚠️ Yes" : "—"}
                      </td>
                      <td className="py-2 px-4 border text-sm">
                        {a.cheatingLogs.length > 0 ? (
                          <ul className="list-disc pl-4 space-y-1">
                            {a.cheatingLogs.map((log, idx) => (
                              <li key={idx}>{log.reason}</li>
                            ))}
                          </ul>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedExam ? (
            <p className="text-cyan-400 mt-4">
              No attempts found for this exam.
            </p>
          ) : (
            <p className="text-gray-400 mt-4">
              Select an exam to view reports.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
