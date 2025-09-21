import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentTable() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/org/students", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStudents(res.data.students || []);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      }
    }

    fetchStudents();
  }, []);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-2">📋 Registered Students</h3>
      {students.length === 0 ? (
        <p>No students added yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-black rounded shadow">
            <thead>
              <tr className="bg-indigo-100 text-left">
                <th className="py-2 px-4">#</th>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Enrollment</th>
                <th className="py-2 px-4">Username</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, index) => (
                <tr key={s._id} className="border-t">
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4">{s.name}</td>
                  <td className="py-2 px-4">{s.enrollment}</td>
                  <td className="py-2 px-4">{s.username || "❌ Not Generated"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
