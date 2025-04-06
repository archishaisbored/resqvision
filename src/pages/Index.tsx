import React from "react";
import RobotEye from "@/components/RobotEye";
import ConsoleHeader from "@/components/ConsoleHeader";
import DroneFeed from "@/components/DroneFeed";
import RobotSpeech from "@/components/RobotSpeech";
import ConsoleFooter from "@/components/ConsoleFooter";
import FullScreenToggle from "@/components/FullScreenToggle";
import { useRobotActivation } from "@/hooks/useRobotActivation";

const TelemetryPanel = () => {
  const [droneData, setDroneData] = React.useState({
    latitude: 0,
    longitude: 0,
    altitude: 0,
    barometer: null,
    timestamp: 0,
    check: 0
  });
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    let ws: WebSocket;

    const connectWebSocket = () => {
      ws = new WebSocket('wss://parameterserver.onrender.com');

      ws.onopen = () => {
        console.log('Connected to WebSocket server');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received telemetry data:', data);
        setDroneData(prev => ({ ...prev, ...data }));
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        setTimeout(connectWebSocket, 1000);
      };
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  return (
    <div className="glass-panel h-full p-4">
      <h2 className="text-xl font-semibold text-white mb-4">Drone Telemetry</h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-white/80">Status:</span>
          <span className={isConnected ? "text-green-500" : "text-red-500"}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/80">Latitude:</span>
          <span className="text-white">{droneData.latitude.toFixed(6)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/80">Longitude:</span>
          <span className="text-white">{droneData.longitude.toFixed(6)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/80">Altitude:</span>
          <span className="text-white">{droneData.altitude.toFixed(2)} m</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/80">Barometer:</span>
          <span className="text-white">
            {droneData.barometer ? `${droneData.barometer.toFixed(2)} hPa` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/80">Last Update:</span>
          <span className="text-white">
            {new Date(droneData.timestamp * 1000).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const { isActivated, isEyeOpen, showConsole, socket } = useRobotActivation();
  const [isDroneFullScreen, setIsDroneFullScreen] = React.useState(false);
  const [isCaptionFullScreen, setIsCaptionFullScreen] = React.useState(false);
  const [isTelemetryFullScreen, setIsTelemetryFullScreen] = React.useState(false);

  React.useEffect(() => {
    if (!socket) return;

    const handleWakeup = () => {
      console.log("👁 Wakeup received from robot");
    };

    socket.on("robot_wakeup", handleWakeup);

    return () => {
      socket.off("robot_wakeup", handleWakeup);
    };
  }, [socket]);

  const handleToggleDroneFullScreen = () => {
    setIsDroneFullScreen(!isDroneFullScreen);
    if (!isDroneFullScreen) {
      setIsCaptionFullScreen(false);
      setIsTelemetryFullScreen(false);
    }
  };

  const handleToggleCaptionFullScreen = () => {
    setIsCaptionFullScreen(!isCaptionFullScreen);
    if (!isCaptionFullScreen) {
      setIsDroneFullScreen(false);
      setIsTelemetryFullScreen(false);
    }
  };

  const handleToggleTelemetryFullScreen = () => {
    setIsTelemetryFullScreen(!isTelemetryFullScreen);
    if (!isTelemetryFullScreen) {
      setIsDroneFullScreen(false);
      setIsCaptionFullScreen(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-robot-dark p-0 flex items-center justify-center overflow-hidden">
      <div className={`fixed inset-0 flex items-center justify-center z-10 transition-opacity duration-1000 ${showConsole ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <RobotEye isOpen={isEyeOpen} />
      </div>

      {showConsole && !isDroneFullScreen && !isCaptionFullScreen && !isTelemetryFullScreen && (
        <FullScreenToggle
          isDroneFullScreen={isDroneFullScreen}
          isCaptionFullScreen={isCaptionFullScreen}
          isTelemetryFullScreen={isTelemetryFullScreen}
          onToggleDroneFullScreen={handleToggleDroneFullScreen}
          onToggleCaptionFullScreen={handleToggleCaptionFullScreen}
          onToggleTelemetryFullScreen={handleToggleTelemetryFullScreen}
        />
      )}

      <div className="w-full h-full mx-auto overflow-hidden">
        {isDroneFullScreen ? (
          <div className="fixed inset-0 z-50 bg-robot-dark overflow-hidden">
            <DroneFeed isActive={showConsole} isFullScreen={true} />
            <button 
              onClick={handleToggleDroneFullScreen}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </button>
          </div>
        ) : isTelemetryFullScreen ? (
          <div className="fixed inset-0 z-50 bg-robot-dark p-4 overflow-hidden">
            <TelemetryPanel />
            <button 
              onClick={handleToggleTelemetryFullScreen}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </button>
          </div>
        ) : (
          <div 
            className={`w-full h-full transition-opacity duration-1000 ease-in-out overflow-hidden
              ${showConsole ? 'opacity-100' : 'opacity-0'}`}
          >
            <ConsoleHeader 
              title="Disaster Management Console" 
              isOnline={showConsole} 
            />
            
            <div className="grid grid-cols-12 gap-4 mt-4 p-4 h-[calc(100vh-200px)]">
              {(!isDroneFullScreen || isCaptionFullScreen) && (
                <div className={`${
                  isCaptionFullScreen ? 'col-span-full h-full' :
                  'col-span-3 h-full'
                } transition-all duration-300`}>
                  <RobotSpeech isActive={showConsole} socket={socket} />
                </div>
              )}
              
              {(!isCaptionFullScreen || isDroneFullScreen) && (
                <div className="col-span-6 h-full transition-all duration-300">
                  <DroneFeed isActive={showConsole} />
                </div>
              )}

              {!isCaptionFullScreen && !isDroneFullScreen && (
                <div className="col-span-3 h-full transition-all duration-300">
                  <TelemetryPanel />
                </div>
              )}
            </div>
            
            <ConsoleFooter isActive={showConsole} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
