
import React, { useState } from 'react';
import { Upload, FileText, Send } from 'lucide-react';
import { toast } from 'sonner';

interface ConsoleFooterProps {
  isActive: boolean;
}

const ConsoleFooter: React.FC<ConsoleFooterProps> = ({ isActive }) => {
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  
  const handleUpload = () => {
    toast.success("Data uploaded to Command Center", {
      description: "All mission logs and drone footage successfully transmitted",
    });
  };
  
  const toggleLogs = () => {
    setIsLogsOpen(prev => !prev);
  };
  
  const handleFeedback = () => {
    toast("Feedback option activated", {
      description: "Voice recognition system enabled",
    });
  };

  return (
    <div className={`w-full opacity-0 ${isActive ? 'animate-fade-in-delay-3' : ''}`}>
      <div className="flex justify-between gap-4 mt-4">
        <button 
          onClick={toggleLogs}
          className="console-button flex items-center justify-center gap-2"
        >
          <FileText size={16} />
          <span>Logs</span>
        </button>
        
        {/* <button 
          onClick={handleUpload}
          className="console-button bg-robot-accent/20 hover:bg-robot-accent/30 flex items-center justify-center gap-2"
        >
          <Upload size={16} />
          <span>Upload to Command Center</span>
        </button> */}
        
        {/* <button 
          onClick={handleFeedback}
          className="console-button flex items-center justify-center gap-2"
        >
          <Send size={16} />
          <span>Feedback</span>
        </button> */}
      </div>
      
      {/* {isLogsOpen && (
        <div className="mt-4 p-4 glass-panel font-mono text-xs text-white/70 h-32 overflow-y-auto animate-slide-up">
          <div className="mb-1">[SYS] &gt; System initialization complete</div>
          <div className="mb-1">[NAV] &gt; GPS coordinates locked: 34.0522° N, 118.2437° W</div>
          <div className="mb-1">[CAM] &gt; Camera feed operational, resolution: 1080p</div>
          <div className="mb-1">[SENSORS] &gt; Environmental data collection active</div>
          <div className="mb-1">[COMMS] &gt; Secure connection established with Command Center</div>
          <div className="mb-1">[MISSION] &gt; Primary objective: Disaster area assessment</div>
          <div className="mb-1">[DRONE] &gt; Airborne unit deployed, telemetry data normal</div>
          <div className="mb-1">[AI] &gt; Hazard detection algorithms activated</div>
          <div className="mb-1">[POWER] &gt; Main power at 97%, backup systems on standby</div>
          <div className="mb-1">[SYS] &gt; All subsystems operational</div>
        </div>
      )} */}
    </div>
  );
};

export default ConsoleFooter;
