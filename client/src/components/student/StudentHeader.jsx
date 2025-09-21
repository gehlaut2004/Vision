import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentHeader() {
  const [studentName, setStudentName] = useState("Student");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setStudentName(payload.name || "Student");
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    navigate("/"); // or wherever your login route is
  };

  return (
    <div className="flex justify-between items-center bg-gray-950 text-cyan-300 px-6 py-4 border-b border-cyan-800 shadow-sm font-mono text-lg">
      <div>Hello, <span className="font-semibold text-orange-500">{studentName}</span></div>
      <button
        onClick={handleLogout}
        className="text-sm font-semibold text-red-400 hover:text-red-300 transition"
      >
        Logout
      </button>
    </div>
  );
}
