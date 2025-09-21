import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function FaceDetection({ onCheatDetected, onStatusChange, active }) {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const lastCheatRef = useRef(null);
  const detectionRef = useRef(true);

  const MODEL_URL = "/models";

  const getEyeAspectRatio = (eye) => {
    const a = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
    const b = Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y);
    const c = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
    return (a + b) / (2.0 * c);
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        console.log("✅ Face-api models loaded");
        setModelsLoaded(true);
      } catch (err) {
        console.error("❌ Model load error:", err);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error("❌ Webcam error:", err);
      }
    };
    startCamera();
  }, []);

  useEffect(() => {
    if (!modelsLoaded || !active) return;

    detectionRef.current = true;

    const interval = setInterval(async () => {
      if (!detectionRef.current || !videoRef.current || videoRef.current.readyState < 2) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (!detection) {
        updateStatus("🔴 Face not visible", "Face not visible");
        return;
      }

      const leftEye = detection.landmarks.getLeftEye();
      const rightEye = detection.landmarks.getRightEye();
      const leftEAR = getEyeAspectRatio(leftEye);
      const rightEAR = getEyeAspectRatio(rightEye);
      const avgEAR = (leftEAR + rightEAR) / 2;

      if (avgEAR < 0.15) {
        updateStatus("🟠 Eyes: Possibly closed", "Eyes closed");
        return;
      }

      const nose = detection.landmarks.getNose()[3];
      const jaw = detection.landmarks.getJawOutline()[8];
      const faceTilt = Math.abs(nose.x - jaw.x);

      if (faceTilt > 60) { // was 40 — more tolerant now
        updateStatus("🟠 Direction: Looking away", "Looking away");
        return;
      }

      updateStatus("🟢 Face: OK | 👁 Eyes: OK | 👀 Direction: OK", null);
    }, 2000);

    return () => {
      clearInterval(interval);
      detectionRef.current = false;
    };
  }, [modelsLoaded, active]);

  const updateStatus = (statusText, reason) => {
    onStatusChange?.(statusText);

    if (reason && lastCheatRef.current !== reason) {
      lastCheatRef.current = reason;
      onCheatDetected?.(reason);
    }

    if (!reason) lastCheatRef.current = null;
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {!modelsLoaded && <div className="text-white">⏳ Loading face detection models...</div>}
      <video
        ref={videoRef}
        className="rounded border border-gray-600"
        autoPlay
        muted
        playsInline
        width="300"
        height="200"
      />
    </div>
  );
}
