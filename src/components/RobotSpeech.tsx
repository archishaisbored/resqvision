import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface RobotSpeechProps {
  isActive: boolean;
  socket: any; // Socket.IO socket instance from parent
}

const RobotSpeech: React.FC<RobotSpeechProps> = ({ isActive, socket }) => {
  const [messages, setMessages] = useState<{text: string, isAssistant: boolean}[]>([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!isActive || !socket) return;

    // Handle assistant messages
    const handleAssistantMessage = (data: { reply: string }) => {
      setMessages(prev => [...prev, {
        text: data.reply,
        isAssistant: true
      }].slice(-5)); // Keep last 5 messages
    };

    // Handle listening status updates
    const handleListeningStatus = (status: boolean) => {
      setIsListening(status);
    };

    // Handle user messages (if you want to display them too)
    const handleUserMessage = (data: { text: string }) => {
      setMessages(prev => [...prev, {
        text: data.text,
        isAssistant: false
      }].slice(-5));
    };

    socket.on('assistant_reply', handleAssistantMessage);
    socket.on('listening_status', handleListeningStatus);
    socket.on('user_message', handleUserMessage);

    return () => {
      socket.off('assistant_reply', handleAssistantMessage);
      socket.off('listening_status', handleListeningStatus);
      socket.off('user_message', handleUserMessage);
    };
  }, [isActive, socket]);

  return (
    <div className={`glass-panel h-full flex flex-col ${isActive ? 'opacity-100' : 'opacity-0'}`}>
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Robot Communication</h2>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-sm text-white/80">
            {isListening ? 'Listening...' : 'Ready'}
          </span>
        </div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        {messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex items-start gap-2 ${msg.isAssistant ? 'text-robot-blue' : 'text-white/90'}`}
              >
                <ArrowRight className={`mt-1 min-w-5 ${msg.isAssistant ? 'text-robot-blue' : 'text-white/50'}`} size={18} />
                <div>{msg.text}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-white/50 italic text-center py-6">
            {isActive 
              ? "Waiting for robot communication..." 
              : "Robot is inactive"}
          </div>
        )}
      </div>
    </div>
  );
};

export default RobotSpeech;