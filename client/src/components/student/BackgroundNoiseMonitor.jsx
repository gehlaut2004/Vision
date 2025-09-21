// components/exam/BackgroundNoiseMonitor.jsx
import { useEffect, useRef } from "react";

export default function BackgroundNoiseMonitor({ onCheatDetected }) {
  const audioRef = useRef(null);

  useEffect(() => {
    let audioCtx;
    let analyser;
    let mic;
    let dataArray;
    let cheatTimeout;
    let noiseCount = 0;

    const initMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        mic = audioCtx.createMediaStreamSource(stream);
        mic.connect(analyser);
        analyser.fftSize = 512;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkNoise = () => {
          analyser.getByteFrequencyData(dataArray);
          const avgVolume =
            dataArray.reduce((a, b) => a + b) / dataArray.length;

          if (avgVolume > 90) {
            noiseCount++;
            if (noiseCount >= 3 && !cheatTimeout) {
              onCheatDetected("Background noise detected");
              cheatTimeout = setTimeout(() => {
                noiseCount = 0;
                cheatTimeout = null;
              }, 10000); // Reset after 10 sec
            }
          }

          requestAnimationFrame(checkNoise);
        };

        checkNoise();
      } catch (err) {
        console.error("🎙️ Mic access error:", err);
      }
    };

    initMic();

    return () => {
      if (audioCtx) audioCtx.close();
    };
  }, [onCheatDetected]);

  return (
    <div className="text-xs text-red-400 font-mono mt-2">
      🎙️ Background noise monitoring active...
    </div>
  );
}
