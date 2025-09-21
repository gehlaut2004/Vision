import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // <== for redirection after login

export default function StudentLoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // <== redirect after successful login

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/student/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save token in localStorage (or cookies if preferred)
      localStorage.setItem("studentToken", data.token);

      setMessage("✅ Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/student/dashboard");
      }, 1000);

    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const CyberInput = useCallback(({ name, type, placeholder, value }) => (
    <div className="relative mb-4">
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="w-full bg-gray-800/80 border-2 border-cyan-400/30 focus:border-cyan-400 rounded-lg px-4 py-3 text-cyan-100 placeholder-purple-300/50 font-mono outline-none transition-all"
      />
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-70"></div>
    </div>
  ), [handleChange]);

  const CyberButton = useCallback(({ children, onClick, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 rounded-lg font-bold font-mono uppercase tracking-wider 
        bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg 
        transition-all ${disabled ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-cyan-500/50'}`}
    >
      {isLoading ? (
        <div className="flex justify-center items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          AUTHENTICATING...
        </div>
      ) : (
        children
      )}
    </button>
  ), [isLoading]);

  return (
    
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col gap-4 relative max-w-md mx-auto p-6"
    >
      
      {/* Water-like background effect */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-20"
        animate={{
          background: `linear-gradient(45deg, 
            rgba(0, 200, 255, 0.05), 
            transparent 70%)`,
        }}
      />
        
      <CyberInput
        name="username"
        type="text"
        placeholder="STUDENT_ID_OR_USERNAME"
        value={formData.username}
      />

      <CyberInput
        name="password"
        type="password"
        placeholder="SECURE_PASSWORD"
        value={formData.password}
      />

      <CyberButton onClick={handleSubmit} disabled={isLoading || !formData.username || !formData.password}>
        ACCESS EXAM PORTAL
      </CyberButton>

      {/* Forgot password link */}
      <motion.a 
        href="#forgot-password" 
        className="text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        whileHover={{ scale: 1.02 }}
      >
        FORGOT CREDENTIALS?
      </motion.a>

      {/* Message display */}
      <AnimatePresence>
        {message && (
          <motion.div
            className={`p-3 rounded-lg text-center font-mono text-sm ${
              message.includes("✅") 
                ? "bg-green-900/30 text-green-300 border border-green-500/30"
                : "bg-red-900/30 text-red-300 border border-red-500/30"
            } mt-2`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Water ripple effect decoration */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30"
        animate={{
          backgroundSize: ["100% 2px", "200% 2px", "100% 2px"],
          backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.form>
  );
}
