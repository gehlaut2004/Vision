import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function ExamLayout({ examDuration, onAutoSubmit, children }) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(examDuration * 60); // in seconds
  const [violationCount, setViolationCount] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const intervalRef = useRef(null);

  const MAX_VIOLATIONS = 3;

  // ⏳ Countdown Timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onAutoSubmit(); // ⏲️ Time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // 🔒 Fullscreen entry
  useEffect(() => {
    const goFullscreen = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    };
    goFullscreen();
    setFullscreen(true);
  }, []);

  // 🚨 Detect cheating
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden || !document.hasFocus()) handleViolation("Focus lost");
    };

    const handleFullscreenExit = () => {
      if (!document.fullscreenElement) {
        setFullscreen(false);
        handleViolation("Fullscreen exited");
      }
    };

    const handleViolation = (reason) => {
      setViolationCount((prev) => {
        const newCount = prev + 1;
        console.warn(`Violation #${newCount}: ${reason}`);
        if (newCount >= MAX_VIOLATIONS) {
          alert("You have violated the rules 3 times. Exam will be submitted.");
          onAutoSubmit();
        }
        return newCount;
      });
    };

    window.addEventListener("blur", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreenExit);

    return () => {
      window.removeEventListener("blur", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreenExit);
    };
  }, []);

  // ⌛ Format time left
  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-cyan-300 font-mono">📝 Exam in Progress</h1>
        <div className="flex items-center gap-6">
          <div className="bg-gray-800 px-4 py-2 rounded-lg text-sm">
            ⏳ Time Left: <span className="text-green-400 font-mono">{formatTime(timeLeft)}</span>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg text-sm">
            🚨 Violations: <span className="text-red-400 font-bold">{violationCount}</span> / {MAX_VIOLATIONS}
          </div>
        </div>
      </div>

      {/* Exam Body */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
