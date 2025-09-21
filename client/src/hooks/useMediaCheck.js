// src/hooks/useMediaCheck.js
import { useEffect, useState } from "react";

export default function useMediaCheck() {
  const [hasWebcam, setHasWebcam] = useState(false);
  const [hasMic, setHasMic] = useState(false);

  useEffect(() => {
    async function checkDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoInput = devices.some((d) => d.kind === "videoinput");
        const hasAudioInput = devices.some((d) => d.kind === "audioinput");

        setHasWebcam(hasVideoInput);
        setHasMic(hasAudioInput);
      } catch (err) {
        console.error("Device detection error:", err);
      }
    }

    checkDevices();
  }, []);

  return { hasWebcam, hasMic };
}
