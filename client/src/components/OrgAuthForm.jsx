import { useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function OrgAuthForm() {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    orgName: "",
    password: ""
  });
  
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [isSignup, setIsSignup] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const API = "http://localhost:5000/api/auth";

  // Stable input handler that won't cause unnecessary re-renders
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // ────── SIGNUP HANDLERS ───────────────────────────
  const handleSendOTP = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API}/request-otp`, { email: formData.email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Failed to send OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API}/verify-otp`, { 
        email: formData.email, 
        otp: formData.otp 
      });
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Invalid or expired OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API}/register`, {
        orgName: formData.orgName,
        email: formData.email,
        password: formData.password,
      });
      setMessage(res.data.message);
      resetForm();
      setIsSignup(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Registration failed. Org may already exist.");
    } finally {
      setIsLoading(false);
    }
  };

  // ────── LOGIN HANDLER ──────────────────────────────
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API}/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (res.data.token && res.data.org) {
        localStorage.setItem("orgToken", res.data.token);
        localStorage.setItem("org", JSON.stringify(res.data.org));
        navigate("/org-dashboard");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      otp: "",
      orgName: "",
      password: ""
    });
    setStep(1);
  };

  // Memoized CyberInput component to prevent unnecessary re-renders
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

  // Memoized CyberButton component
  const CyberButton = useCallback(({ children, onClick, color = "purple", disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full py-3 rounded-lg font-bold font-mono uppercase tracking-wider ${
        color === "purple"
          ? "bg-purple-600 hover:bg-purple-700"
          : color === "cyan"
          ? "bg-cyan-600 hover:bg-cyan-700"
          : "bg-yellow-600 hover:bg-yellow-700"
      } text-white shadow-lg transition-all ${
        (disabled || isLoading) ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg"
      }`}
    >
      {isLoading ? (
        <div className="flex justify-center items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          PROCESSING...
        </div>
      ) : (
        children
      )}
    </button>
  ), [isLoading]);

  return (
    <div className="flex flex-col gap-4 mt-4 relative overflow-hidden max-w-md mx-auto p-6">
      {/* Background animation */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: `linear-gradient(45deg, 
            ${isSignup ? "rgba(0, 200, 255, 0.03)" : "rgba(150, 0, 255, 0.03)"},
            transparent 70%)`,
        }}
      />

      {/* Toggle between Signup/Login */}
      <motion.div className="flex justify-center mb-6 relative">
        <motion.div
          className="absolute bottom-0 h-1 bg-cyan-400 rounded-full"
          animate={{
            width: "50%",
            x: isSignup ? "-50%" : "50%",
            background: isSignup
              ? "linear-gradient(90deg, rgba(0,255,255,0.8), rgba(0,200,255,0.5))"
              : "linear-gradient(90deg, rgba(150,0,255,0.8), rgba(200,0,255,0.5))",
          }}
        />
        <div className="bg-gray-800/80 rounded-full p-1 border border-cyan-400/20 backdrop-blur-sm">
          <button
            onClick={() => {
              setIsSignup(true);
              resetForm();
              setMessage("");
            }}
            className={`px-6 py-2 rounded-full text-sm font-mono relative z-10 ${
              isSignup ? "text-white" : "text-cyan-300 hover:text-white"
            } transition-colors duration-300`}
          >
            SIGN UP
          </button>
          <button
            onClick={() => {
              setIsSignup(false);
              resetForm();
              setMessage("");
            }}
            className={`px-6 py-2 rounded-full text-sm font-mono relative z-10 ${
              !isSignup ? "text-white" : "text-purple-300 hover:text-white"
            } transition-colors duration-300`}
          >
            LOG IN
          </button>
        </div>
      </motion.div>

      {/* Message display */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            className={`p-3 rounded-lg text-center font-mono text-sm ${
              message.includes("❌")
                ? "bg-red-900/50 text-red-300 border border-red-500/30"
                : "bg-green-900/30 text-green-300 border border-green-500/30"
            }`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form container - Removed motion.div wrappers that were causing re-renders */}
      <div className="relative min-h-[300px]">
        {isSignup ? (
          <>
            {step === 1 && (
              <div className="space-y-4">
                <CyberInput
                  name="email"
                  type="email"
                  placeholder="OFFICIAL_EMAIL@DOMAIN.COM"
                  value={formData.email}
                />
                <CyberButton 
                  onClick={handleSendOTP} 
                  color="cyan"
                  disabled={!formData.email.includes("@")}
                >
                  SEND OTP VERIFICATION
                </CyberButton>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <CyberInput
                  name="otp"
                  type="text"
                  placeholder="ENTER_6_DIGIT_OTP"
                  value={formData.otp}
                />
                <CyberButton 
                  onClick={handleVerifyOTP} 
                  color="yellow"
                  disabled={formData.otp.length < 6}
                >
                  VERIFY IDENTITY
                </CyberButton>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <CyberInput
                  name="orgName"
                  type="text"
                  placeholder="ORGANIZATION_NAME"
                  value={formData.orgName}
                />
                <CyberInput
                  name="password"
                  type="password"
                  placeholder="SET_SECURE_PASSWORD"
                  value={formData.password}
                />
                <CyberButton 
                  onClick={handleRegister}
                  disabled={!formData.orgName || formData.password.length < 6}
                >
                  COMPLETE REGISTRATION
                </CyberButton>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <CyberInput
              name="email"
              type="email"
              placeholder="OFFICIAL_EMAIL@DOMAIN.COM"
              value={formData.email}
            />
            <CyberInput
              name="password"
              type="password"
              placeholder="ENTER_PASSWORD"
              value={formData.password}
            />
            <CyberButton 
              onClick={handleLogin}
              disabled={!formData.email.includes("@") || !formData.password}
            >
              ACCESS ADMIN CONSOLE
            </CyberButton>
          </div>
        )}
      </div>

      {/* Bottom animation */}
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
    </div>
  );
}