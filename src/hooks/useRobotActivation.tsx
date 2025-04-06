import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

// Ensure socket is only created once
const socket: Socket = io("https://fateh-2.onrender.com", {
  transports: ["websocket"],
});

export function useRobotActivation() {
  const [isActivated, setIsActivated] = useState(false);
  const [isEyeOpen, setIsEyeOpen] = useState(false);
  const [showConsole, setShowConsole] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to socket for activation");
    });

    socket.on("robot_wakeup", () => {
      console.log("👁️ Robot Wakeup signal received!");
      setIsActivated(true);
    });

    return () => {
      socket.off("robot_wakeup");
    };
  }, []);

  // Handle Eye and Console animation after activation
  useEffect(() => {
    if (isActivated) {
      const leftEyeTimer = setTimeout(() => {
        setIsEyeOpen(true);
      }, 1000);

      const consoleTimer = setTimeout(() => {
        setShowConsole(true);
      }, 4000);

      return () => {
        clearTimeout(leftEyeTimer);
        clearTimeout(consoleTimer);
      };
    }
  }, [isActivated]);

  return { isActivated, isEyeOpen, showConsole, socket };
}
