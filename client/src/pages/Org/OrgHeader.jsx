import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function OrgHeader({ orgName = "Your Org" }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("orgToken"); // 🔐 Clear org token (or use your token key)
    localStorage.removeItem("orgEmail"); // Optional: Clear saved org email if stored
    navigate("/"); // ⬅️ Redirect to org login
  };

  return (
    <header className="bg-gray-700/80 backdrop-blur-md p-4 flex justify-between items-center  rounded-xl shadow-md mt-1">
      <motion.h1
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-xl font-semibold text-gray-100"
      >
        Welcome, <span className="text-indigo-300">{orgName}</span>
      </motion.h1>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-red-500/20 transition-all duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Logout
      </motion.button>
    </header>
  );
}
