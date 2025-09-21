import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function UpcomingExamsCard({ expanded, onToggle }) {
  const [state, setState] = useState({
    exams: [],
    loading: true,
    error: null,
    editingId: null,
    updatedExam: null,
  });

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("orgToken")}`,
  });

  const fetchExams = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const res = await axios.get(
        "http://localhost:5000/api/org/exams/upcoming",
        { headers: getAuthHeaders() }
      );
      setState((prev) => ({ ...prev, exams: res.data, loading: false }));
    } catch (err) {
      console.error("Error fetching upcoming exams:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.message || "Failed to fetch exams",
      }));
      toast.error("Failed to load exams");
    }
  };

  const handleEdit = (exam) => {
    setState((prev) => ({
      ...prev,
      editingId: exam._id,
      updatedExam: {
        ...exam,
        startTime: new Date(exam.startTime).toISOString().slice(0, 16),
      },
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      updatedExam: {
        ...prev.updatedExam,
        [name]: name === "duration" ? parseInt(value) || 0 : value,
      },
    }));
  };

  const handleUpdate = async () => {
    if (!state.updatedExam) return;
    try {
      const examToUpdate = {
        ...state.updatedExam,
        startTime: new Date(state.updatedExam.startTime).toISOString(),
      };

      await axios.put(
        `http://localhost:5000/api/org/exams/${state.editingId}`,
        examToUpdate,
        { headers: getAuthHeaders() }
      );

      toast.success("Exam updated successfully!");
      setState((prev) => ({
        ...prev,
        editingId: null,
        updatedExam: null,
      }));
      fetchExams();
    } catch (err) {
      console.error("Error updating exam:", err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleCancelEdit = () => {
    setState((prev) => ({ ...prev, editingId: null, updatedExam: null }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/org/exams/${id}`, {
        headers: getAuthHeaders(),
      });

      setState((prev) => ({
        ...prev,
        exams: prev.exams.filter((exam) => exam._id !== id),
      }));
      toast.success("Exam deleted successfully");
    } catch (err) {
      console.error("Error deleting exam:", err);
      toast.error(err.response?.data?.message || "Failed to delete exam");
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const { exams, loading, error, editingId, updatedExam } = state;

  return (
    <motion.div
      className={`bg-gradient-to-br from-yellow-800 to-yellow-700 text-white rounded-xl border border-yellow-400 shadow-xl p-6 transition-all duration-300 hover:ring-2 hover:ring-yellow-400 hover:scale-[1.01] cursor-pointer ${
        expanded ? "col-span-full" : ""
      }`}
      onClick={onToggle}
    >
      <h3 className="text-xl font-bold flex items-center">⏳ Upcoming Exams</h3>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out px-2 md:px-4 ${
          expanded ? "max-h-[3000px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-4">
          <button
            onClick={fetchExams}
            className="text-sm bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 rounded"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "⟳ Refresh"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading && !exams.length ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : exams.length === 0 ? (
          <p className="text-gray-300 italic">No upcoming exams scheduled.</p>
        ) : (
          <ul className="space-y-4">
            {exams.map((exam) => (
              <li
                key={exam._id}
                className="border border-yellow-200 p-4 rounded-lg bg-white text-gray-900 shadow-sm hover:shadow-md transition-shadow"
              >
                {editingId === exam._id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Exam Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={updatedExam?.title || ""}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        name="startTime"
                        value={updatedExam?.startTime || ""}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        min="1"
                        value={updatedExam?.duration || 0}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-black"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleUpdate}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                      >
                        💾 Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {exam.title}
                    </h4>
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <p>🕒 {new Date(exam.startTime).toLocaleString()}</p>
                      <p>⏳ Duration: {exam.duration} minutes</p>
                    </div>
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(exam);
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(exam._id);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
