import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function LiveExamsCard({ expanded, onToggle }) {
  const [state, setState] = useState({
    exams: [],
    loading: true,
    error: null,
    cancellingId: null,
    startingId: null,
  });

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("orgToken")}`,
  });

  const fetchLiveExams = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const res = await axios.get("http://localhost:5000/api/org/exams/live", {
        headers: getAuthHeaders(),
      });

      setState((prev) => ({
        ...prev,
        exams: res.data,
        loading: false,
      }));
    } catch (err) {
      console.error("Error fetching live exams:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.message || "Failed to fetch live exams",
      }));
      toast.error("Failed to load live exams");
    }
  };

  const cancelExam = async (examId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this exam? All student progress will be lost."
      )
    )
      return;

    try {
      setState((prev) => ({ ...prev, cancellingId: examId }));

      await axios.delete(`http://localhost:5000/api/org/exams/${examId}`, {
        headers: getAuthHeaders(),
      });

      toast.success("Exam cancelled successfully");
      fetchLiveExams();
    } catch (err) {
      console.error("Failed to cancel exam:", err);
      toast.error(err.response?.data?.message || "Failed to cancel exam");
    } finally {
      setState((prev) => ({ ...prev, cancellingId: null }));
    }
  };

  const startExamNow = async (examId) => {
    if (!window.confirm("Start this exam immediately?")) return;

    try {
      setState((prev) => ({ ...prev, startingId: examId }));

      await axios.post(
        `http://localhost:5000/api/org/exams/start-now/${examId}`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );

      toast.success("Exam started successfully");
      fetchLiveExams();
    } catch (err) {
      console.error("Failed to start exam:", err);
      toast.error(err?.response?.data?.message || "Failed to start exam");
    } finally {
      setState((prev) => ({ ...prev, startingId: null }));
    }
  };

  useEffect(() => {
    fetchLiveExams();
  }, []);

  const { exams, loading, error, cancellingId, startingId } = state;

  return (
    <motion.div
      className={`bg-gradient-to-br from-red-900 to-red-800 rounded-xl border border-red-500 text-white shadow-xl p-6 transition-all duration-300 hover:ring-2 hover:ring-red-400 hover:scale-[1.01] cursor-pointer ${
        expanded ? "col-span-full" : ""
      }`}
      onClick={onToggle}
    >
      <h3 className="text-xl font-bold flex items-center">
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        Live Exams
      </h3>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out px-2 md:px-4 ${
          expanded ? "max-h-[3000px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {error && (
          <div className="bg-red-200 border border-red-400 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end mb-4">
          <button
            onClick={fetchLiveExams}
            className="text-sm bg-red-200 hover:bg-red-300 px-3 py-1 rounded text-red-800"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "⟳ Refresh"}
          </button>
        </div>

        {loading && !exams.length ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-6 text-gray-300">
            <svg
              className="w-12 h-12 mx-auto text-red-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-2">No live exams currently running</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {exams.map((exam) => (
              <li
                key={exam._id}
                className="border border-red-300 p-4 rounded-lg bg-white text-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <h4 className="text-lg font-semibold">{exam.title}</h4>
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <p>
                        🕒 Started:{" "}
                        {new Date(exam.startTime).toLocaleString()}
                      </p>
                      <p>⏳ Duration: {exam.duration} minutes</p>
                      <p>👥 Participants: {exam.participantsCount || 0}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <button
                      onClick={() => startExamNow(exam._id)}
                      disabled={startingId === exam._id}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {startingId === exam._id ? "Starting..." : "▶ Start Now"}
                    </button>
                    <button
                      onClick={() => cancelExam(exam._id)}
                      disabled={cancellingId === exam._id}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {cancellingId === exam._id
                        ? "Cancelling..."
                        : "Cancel Exam"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
