import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UpcomingExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem("studentToken");
        const res = await axios.get("http://localhost:5000/api/student/exams/upcoming", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setExams(res.data.exams || []);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching upcoming exams:", err);
        setError("Failed to load upcoming exams");
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  if (loading) return <p className="text-white text-lg p-6">Loading exams...</p>;
  if (error) return <p className="text-red-400 text-lg p-6">{error}</p>;
  if (exams.length === 0)
    return <p className="text-gray-400 text-lg p-6">No upcoming exams.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-purple-300 mb-4">📅 Upcoming Exams</h2>
      <div className="grid gap-4">
        {exams.map((exam) => (
          <div
            key={exam._id}
            className="bg-gray-800 hover:bg-gray-700 border border-purple-500 rounded-xl p-4 shadow-md transition cursor-pointer"
            onClick={() => navigate(`/student/exam/${exam._id}`)}
          >
            <h3 className="text-lg text-purple-200 font-bold">{exam.title}</h3>
            <p className="text-gray-300">
              🕒 Starts:{" "}
              {new Date(exam.startTime).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            <p className="text-gray-400">⏳ Duration: {exam.duration} mins</p>
          </div>
        ))}
      </div>
    </div>
  );
}
