import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import useMediaCheck from "../../hooks/useMediaCheck";
import ExamLayout from "../../components/student/ExamLayout";
import QuestionRenderer from "../../components/student/QuestionRenderer";
import FaceDetection from "../../components/student/FaceDetection";
import BackgroundNoiseMonitor from "../../components/student/BackgroundNoiseMonitor";

export default function StudentExamPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [cheatCount, setCheatCount] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [faceStatus, setFaceStatus] = useState("⏳ Initializing...");
  const [proctoringActive, setProctoringActive] = useState(true);

  const navigate = useNavigate();
  const { hasWebcam, hasMic } = useMediaCheck();
  const alreadyAutoSubmitted = useRef(false);
  const cheatLogsRef = useRef([]);
  const popupCooldownRef = useRef(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const token = localStorage.getItem("studentToken");
        const res = await axios.get(
          `http://localhost:5000/api/student/exams/${examId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setExam(res.data.exam);
      } catch (err) {
        console.error("❌ Failed to load exam:", err);
      }
    };

    fetchExam();
  }, [examId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        issueCheating("Tab switched");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const issueCheating = (reason) => {
    if (!proctoringActive) return;

    const timestamp = new Date().toISOString();
    cheatLogsRef.current.push({ reason, timestamp });

    setCheatCount((prev) => {
      const newCount = prev + 1;

      if (!popupCooldownRef.current && newCount <= 3) {
        alert(`⚠️ Cheating detected: ${reason}\nAttempt ${newCount}/3`);
        popupCooldownRef.current = true;
        setTimeout(() => {
          popupCooldownRef.current = false;
        }, 3000);
      }

      if (newCount >= 3 && !alreadyAutoSubmitted.current) {
        handleSubmit([], true);
      }

      return newCount;
    });
  };

  const handleSubmit = async (answers, auto = false) => {
    if (alreadyAutoSubmitted.current) return;

    try {
      const token = localStorage.getItem("studentToken");
      await axios.post(
        `http://localhost:5000/api/student/attempts/${examId}`,
        {
          answers,
          isAutoSubmitted: auto,
          cheatingLogs: cheatLogsRef.current,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alreadyAutoSubmitted.current = true;
      setProctoringActive(false);
      alert("✅ Exam submitted!");
      navigate("/student/dashboard");
    } catch (err) {
      console.error("❌ Submission failed:", err);
    }
  };

  const handleStart = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }

      const preventMinimize = (e) => {
        e.preventDefault();
        e.returnValue = "";
      };

      window.addEventListener("beforeunload", preventMinimize);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setCameraStream(stream);
      setExamStarted(true);

      return () => {
        window.removeEventListener("beforeunload", preventMinimize);
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        }
        stream.getTracks().forEach((track) => track.stop());
      };
    } catch (err) {
      console.error("❌ Fullscreen/Webcam error:", err);
      alert("Camera or Mic permission denied.");
    }
  };

  if (!exam) return <p className="text-white p-10">Loading exam...</p>;

  if (!examStarted) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
        <h1 className="text-2xl font-bold mb-4">📘 {exam.title}</h1>
        <p className="mb-6 text-gray-300">{exam.description}</p>
        <button
          onClick={handleStart}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          🚀 Start Exam
        </button>
      </div>
    );
  }

  return (
    <ExamLayout
      examDuration={exam.duration}
      onAutoSubmit={() => handleSubmit([], true)}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <FaceDetection
            onCheatDetected={issueCheating}
            onStatusChange={(status) => setFaceStatus(status)}
            active={proctoringActive}
          />
          <BackgroundNoiseMonitor
            onCheatDetected={issueCheating}
          />
          <div className="text-yellow-400 font-mono text-sm">
            Cheating Attempts: {cheatCount}/3
          </div>
          <div className="text-green-300 font-mono text-xs border border-green-500 p-2 rounded">
            {faceStatus}
          </div>
        </div>

        <div className="md:col-span-3">
          <QuestionRenderer
            questions={exam.questions}
            onSubmit={(answers) => handleSubmit(answers, false)}
          />
        </div>
      </div>
    </ExamLayout>
  );
}
