import React from 'react';
import { EyeOffIcon } from 'lucide-react';

interface RobotEyeProps {
  isOpen: boolean;
}

const RobotEye: React.FC<RobotEyeProps> = ({ isOpen }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-screen h-screen flex items-center justify-center bg-robot-dark">
        <div className="flex gap-16 items-center justify-center transform scale-100 md:scale-125 lg:scale-150">
          {/* Left Eye */}
          <div className="relative w-40 h-40 rounded-full bg-black/20 backdrop-blur-lg border border-white/10 flex items-center justify-center overflow-hidden">
            {isOpen ? (
              <div className="relative">
                <div className="w-40 h-40 absolute top-0 left-0 bg-gradient-to-br from-robot-accent/30 to-transparent opacity-50 rounded-full"></div>
                <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-robot-medium flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full overflow-hidden relative flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-robot-accent relative flex items-center justify-center animate-pulse-slow">
                        <div className="w-6 h-6 rounded-full bg-black"></div>
                        <div className="w-3 h-3 rounded-full bg-white absolute top-3 right-3"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`absolute top-0 left-0 w-full bg-robot-dark transition-all duration-700 ease-in-out ${isOpen ? 'h-0' : 'h-full'}`}></div>
              </div>
            ) : (
              <div className="text-gray-400 animate-pulse">
                <EyeOffIcon size={50} />
              </div>
            )}
          </div>

          {/* Right Eye (duplicate structure) */}
          <div className="relative w-40 h-40 rounded-full bg-black/20 backdrop-blur-lg border border-white/10 flex items-center justify-center overflow-hidden">
            {isOpen ? (
              <div className="relative">
                <div className="w-40 h-40 absolute top-0 left-0 bg-gradient-to-br from-robot-accent/30 to-transparent opacity-50 rounded-full"></div>
                <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-robot-medium flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full overflow-hidden relative flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-robot-accent relative flex items-center justify-center animate-pulse-slow">
                        <div className="w-6 h-6 rounded-full bg-black"></div>
                        <div className="w-3 h-3 rounded-full bg-white absolute top-3 right-3"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`absolute top-0 left-0 w-full bg-robot-dark transition-all duration-800 ease-in-out delay-200 ${isOpen ? 'h-0' : 'h-full'}`}></div>
              </div>
            ) : (
              <div className="text-gray-400 animate-pulse">
                <EyeOffIcon size={50} />
              </div>
            )}
          </div>
        </div>
        <div className={`text-xl font-medium text-center absolute bottom-20 transition-all duration-500 ${isOpen ? 'text-robot-accent' : 'text-gray-500'}`}>
          {isOpen ? "SYSTEM ONLINE" : "STANDBY MODE"}
        </div>
      </div>
    </div>
  );
};

export default RobotEye;
