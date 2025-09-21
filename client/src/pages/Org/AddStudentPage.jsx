import { useState, useEffect } from "react";
import OrgHeader from "./OrgHeader";
import OrgSidebar from "./OrgSidebar";
import StudentForm from "../../components/org/StudentForm";
import UploadCSV from "../../components/org/UploadCSV";
import axios from "axios";

export default function AddStudentPage() {
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", password: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("orgToken");
      const res = await axios.get("http://localhost:5000/api/org/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("❌ Failed to fetch students:", err);
    }
  };

  const handleStudentAdded = (student) => {
    setStudents((prev) => [...prev, student]);
  };

  const handleBulkUpload = (newStudents) => {
    setStudents((prev) => [...prev, ...newStudents]);
  };

  const handleDownloadCSV = () => {
    if (students.length === 0) return;
    const headers = ["Name", "Enrollment", "Username", "Password"];
    const rows = students.map((stu) => [
      stu.name,
      stu.enrollment,
      stu.username,
      stu.password,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("orgToken");
    try {
      await axios.delete(`http://localhost:5000/api/org/student/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents((prev) => prev.filter((stu) => stu._id !== id));
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    } catch (err) {
      console.error("❌ Failed to delete student:", err);
      alert("Failed to delete student.");
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    const token = localStorage.getItem("orgToken");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/org/students/bulk-delete",
        { ids: selectedIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setStudents((prev) =>
        prev.filter((stu) => !selectedIds.includes(stu._id))
      );
      setSelectedIds([]);
    } catch (err) {
      console.error("❌ Bulk delete error:", err);
      alert("Failed to delete selected students.");
    }
  };

  const startEditing = (stu) => {
    setEditingId(stu._id);
    setEditForm({ name: stu.name, password: stu.password });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ name: "", password: "" });
  };

  const handleEditSave = async (id) => {
    const token = localStorage.getItem("orgToken");
    try {
      await axios.patch(
        `http://localhost:5000/api/org/student/${id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents((prev) =>
        prev.map((stu) => (stu._id === id ? { ...stu, ...editForm } : stu))
      );
      cancelEditing();
    } catch (err) {
      console.error("❌ Failed to update student:", err);
      alert("Update failed");
    }
  };

  const filteredStudents = students.filter((stu) => {
  const q = (searchQuery || "").toLowerCase();
  return (
    (stu.name || "").toLowerCase().includes(q) ||
    (stu.enrollment || "").toLowerCase().includes(q) ||
    (stu.username || "").toLowerCase().includes(q)
  );
});

  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex h-screen bg-gray-800">
      <OrgSidebar />
      <div className="flex-1 flex flex-col">
        <OrgHeader orgName="CodeAcademy" />
        <main className="flex-1 p-6 text-white space-y-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-2">➕ Add Students</h2>

          <div className="flex flex-wrap gap-6">
            <StudentForm onStudentAdded={handleStudentAdded} />
            <UploadCSV onUploadSuccess={handleBulkUpload} />
          </div>

          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">📋 All Students</h3>
              <div className="flex gap-2">
                {selectedIds.length > 0 && (
                  <>
                    <button
                      onClick={handleBulkDelete}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      🗑 Delete Selected ({selectedIds.length})
                    </button>
                    <button
                      onClick={() => setSelectedIds([])}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                      ✖ Cancel Selection
                    </button>
                  </>
                )}
                <button
                  onClick={handleDownloadCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  ⬇️ Download CSV
                </button>
              </div>
            </div>

            <input
              type="text"
              placeholder="🔍 Search by name, enrollment, or username"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="mb-4 w-full md:w-1/2 p-2 bg-gray-900 text-white border border-gray-600 rounded"
            />

            <table className="w-full text-left text-white border border-gray-600">
              <thead className="bg-gray-700 text-sm">
                <tr>
                  <th className="p-2"></th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Enrollment</th>
                  <th className="p-2">Username</th>
                  <th className="p-2">Password</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-400">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((stu) => {
                    const isSelected = selectedIds.includes(stu._id);
                    return (
                      <tr
                        key={stu._id}
                        className={`border-t border-gray-700 hover:bg-gray-700/30 ${
                          isSelected ? "bg-gray-700/40" : ""
                        }`}
                      >
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(stu._id)}
                          />
                        </td>
                        <td className="p-2">
                          {editingId === stu._id ? (
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  name: e.target.value,
                                })
                              }
                              className="bg-gray-800 border px-2 py-1 rounded w-full"
                            />
                          ) : (
                            stu.name
                          )}
                        </td>
                        <td className="p-2">{stu.enrollment}</td>
                        <td className="p-2">{stu.username}</td>
                        <td className="p-2">
                          {editingId === stu._id ? (
                            <input
                              type="text"
                              value={editForm.password}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  password: e.target.value,
                                })
                              }
                              className="bg-gray-800 border px-2 py-1 rounded w-full"
                            />
                          ) : (
                            stu.password
                          )}
                        </td>
                        <td className="p-2 space-x-2">
                          {editingId === stu._id ? (
                            <>
                              <button
                                onClick={() => handleEditSave(stu._id)}
                                className="text-green-400 hover:text-green-600"
                              >
                                💾 Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-gray-400 hover:text-white"
                              >
                                ✖ Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(stu)}
                                className="text-yellow-300 hover:text-yellow-500"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDelete(stu._id)}
                                className="text-red-400 hover:text-red-600"
                              >
                                🗑 Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex justify-center mt-4 gap-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50 hover:bg-gray-600"
                >
                  ⬅️ Previous
                </button>
                <span className="self-center text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50 hover:bg-gray-600"
                >
                  Next ➡️
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
