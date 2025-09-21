import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function RecentExamsCard({ expanded, onToggle }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("orgToken")}`,
  });

  const fetchRecentExams = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/org/exams/recent",
        { headers: getAuthHeaders() }
      );
      setExams(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching recent exams:", err);
      toast.error("Failed to load recent exams");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (exam) => {
    if (
      !exam.attempts ||
      !Array.isArray(exam.attempts) ||
      exam.attempts.length === 0
    ) {
      alert("⚠️ No attempt data available for this exam.");
      return;
    }

    const rows = [
      ["Student ID", "Score", "Cheated"],
      ...exam.attempts.map((a) => [
        a.studentId || "Unknown",
        a.score ?? "N/A",
        a.cheated ? "YES" : "NO",
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => {
            if (cell === "YES") return `"=HYPERLINK(""#red"",""YES"")"`;
            return cell;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exam.title.replace(/\s+/g, "_")}_Report.csv`;
    link.click();
  };

  useEffect(() => {
    fetchRecentExams();
  }, []);

  return (
    <motion.div
      className={`bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded-xl border border-blue-500 shadow-xl p-6 transition-all duration-300 hover:ring-2 hover:ring-blue-400 hover:scale-[1.01] cursor-pointer ${
        expanded ? "col-span-full" : ""
      }`}
      onClick={onToggle}
    >
      <h3 className="text-xl font-bold flex items-center">📊 Recent Exams</h3>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out px-2 md:px-4 ${
          expanded ? "max-h-[3000px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="py-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 inline-block"></div>
          </div>
        ) : exams.length === 0 ? (
          <p className="text-gray-300 italic">No recent exams.</p>
        ) : (
          <ul className="space-y-4">
            {exams.map((exam) => (
              <li
                key={exam._id}
                className="border border-blue-300 p-4 rounded bg-white text-gray-900 shadow-sm hover:shadow-md transition-shadow"
              >
                <h4 className="text-lg font-semibold">{exam.title}</h4>
                <p className="mt-1 text-sm text-gray-700 space-y-1">
                  🗓️ {new Date(exam.startTime).toLocaleString()} <br />
                  📌 Total Attempts:{" "}
                  <span className="font-medium">{exam.totalAttempts || 0}</span>{" "}
                  <br />
                  📊 Average Score:{" "}
                  <span className="font-medium">
                    {exam.avgScore ? Number(exam.avgScore).toFixed(2) : "0.00"}
                  </span>
                </p>

                <div className="mt-3 flex gap-2 flex-wrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadReport(exam);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    📥 Download CSV Report
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/org/report/${exam._id}`);
                    }}
                    className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
                  >
                    🧾 View Report
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
