
import React from 'react';
import { CircleIcon } from 'lucide-react';

interface ConsoleHeaderProps {
  title: string;
  isOnline: boolean;
}

const ConsoleHeader: React.FC<ConsoleHeaderProps> = ({ title, isOnline }) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white/5 backdrop-blur-md border-b border-white/10 rounded-t-lg">
      <div className="flex items-center gap-3">
        <h1 className="text-white font-medium">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <CircleIcon className={`w-4 h-4 ${isOnline ? 'text-robot-success animate-pulse-slow' : 'text-robot-danger'}`} fill={isOnline ? '#10B981' : '#EF4444'} />
        <span className={`text-sm ${isOnline ? 'text-robot-success' : 'text-robot-danger'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
};

export default ConsoleHeader;
