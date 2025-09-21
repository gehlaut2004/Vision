import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LiveExams() {
  const [liveExams, setLiveExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLiveExams = async () => {
      const token = localStorage.getItem("studentToken");

      try {
        const res = await axios.get("http://localhost:5000/api/student/exams/live", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLiveExams(res.data.exams || []);
      } catch (err) {
        console.error("❌ Error fetching live exams:", err);
        alert("Failed to load live exams.");
      } finally {
        setLoading(false);
      }
    };

    fetchLiveExams();
  }, []);

  const handleJoin = (examId) => {
    navigate(`/student/exam/${examId}`);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white font-mono">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">📡 Live Exams</h1>

      {loading ? (
        <p className="text-cyan-300">Loading...</p>
      ) : liveExams.length === 0 ? (
        <p className="text-yellow-400">You have no live exams right now.</p>
      ) : (
        <div className="space-y-6">
          {liveExams.map((exam) => (
            <div
              key={exam._id}
              className="bg-gray-800 border border-cyan-600 rounded-lg p-5 shadow"
            >
              <h2 className="text-xl font-semibold text-cyan-300">{exam.title}</h2>
              <p className="text-sm text-gray-300">{exam.description}</p>
              <p className="text-sm text-gray-400">
                Started: {new Date(exam.startTime).toLocaleString()}
              </p>
              <p className="text-sm text-gray-400 mb-2">Duration: {exam.duration} min</p>

              <button
                onClick={() => handleJoin(exam._id)}
                className="px-4 py-2 mt-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
              >
                🎯 Join Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
