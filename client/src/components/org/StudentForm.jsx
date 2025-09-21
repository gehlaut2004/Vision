import { useState } from "react";
import axios from "axios";

export default function StudentForm({ onStudentAdded }) {
  const [name, setName] = useState("");
  const [enrollment, setEnrollment] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddStudent = async () => {
    if (!name.trim() || !enrollment.trim()) {
      setResult({ error: "Please fill all fields." });
      return;
    }

    try {
      setLoading(true);
     const token = localStorage.getItem("orgToken"); // ✅ use correct key
      const res = await axios.post(
        "http://localhost:5000/api/org/add-student",
        { name, enrollment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setResult({ success: res.data.student });
      onStudentAdded && onStudentAdded(res.data.student);
      setName("");
      setEnrollment("");
    } catch (err) {
      setResult({ error: err.response?.data?.message || "Failed to add student." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 p-4 rounded-lg border border-white/10 w-full max-w-md text-white">
      <h2 className="text-xl font-bold mb-4">Add New Student</h2>

      <input
        type="text"
        placeholder="Student Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-2 w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
      />

      <input
        type="text"
        placeholder="Enrollment Number"
        value={enrollment}
        onChange={(e) => setEnrollment(e.target.value)}
        className="mb-2 w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
      />

      <button
        onClick={handleAddStudent}
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 transition py-2 px-4 rounded font-semibold"
      >
        {loading ? "Adding..." : "Add Student"}
      </button>

      {result?.error && (
        <p className="text-red-400 mt-2">{result.error}</p>
      )}

      {result?.success && (
        <div className="mt-3 p-2 bg-green-900/40 border border-green-500 rounded">
          <p><strong>Username:</strong> {result.success.username}</p>
          <p><strong>Password:</strong> {result.success.password}</p>
        </div>
      )}
    </div>
  );
}
