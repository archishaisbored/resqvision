import React, { useState, useEffect, useRef } from 'react';
import { MapIcon, Loader2Icon, CameraIcon } from 'lucide-react';
import { io } from 'socket.io-client';

interface DroneFeedProps {
  isActive: boolean;
  isFullScreen?: boolean;
}

const DroneFeed: React.FC<DroneFeedProps> = ({ isActive, isFullScreen = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLImageElement>(null);
  const mapContainerRef = useRef<HTMLIFrameElement>(null);
  const [coordinates, setCoordinates] = useState({ lat: '34.0522° N', long: '118.2437° W', alt: '45M' });
  const [mapUrl, setMapUrl] = useState('');

  if (typeof window === 'undefined') return null;

  // Coordinate WebSocket (Drone GPS Feed)
  useEffect(() => {
    const coordSocket = new WebSocket('wss://parameterserver.onrender.com/');

    coordSocket.onopen = () => {
      console.log('Coordinate WebSocket connected');
    };

    coordSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.latitude && data.longitude && data.altitude) {
          setCoordinates({
            lat: `${data.latitude}° N`,
            long: `${data.longitude}° E`,
            alt: `${data.altitude}M`
          });
        }
      } catch (err) {
        console.error('Invalid coordinates data:', err);
      }
    };

    coordSocket.onerror = (err) => console.error('Coordinate WebSocket error:', err);
    coordSocket.onclose = () => console.log('Coordinate WebSocket closed');

    return () => coordSocket.close();
  }, []);

  // Socket.IO listener for voice-controlled fullscreen toggle
  useEffect(() => {
    const socket = io('http://localhost:4000');

    socket.on('control', (data) => {
      if (data?.action === 'fullscreen') {
        setShowMap(false);
        document.documentElement.requestFullscreen?.();
      } else if (data?.action === 'minimize') {
        document.exitFullscreen?.();
      } else if (data?.action === 'toggle_infrared') {
        setShowMap((prev) => !prev);
      } else if (data?.action === 'pause') {
        if (videoRef.current) videoRef.current.style.filter = 'grayscale(100%)';
      } else if (data?.action === 'resume') {
        if (videoRef.current) videoRef.current.style.filter = 'none';
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Simulate loading
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Video feed WebSocket
  useEffect(() => {
    if (!isActive || isLoading || showMap) return;

    const connectWebSocket = () => {
      const wsUrl = 'wss://camserverndrf.onrender.com';
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.binaryType = 'blob';

      ws.onopen = () => {
        console.log('Drone WebSocket connected');
        setStreamReady(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        if (videoRef.current) {
          const blob = event.data;
          const url = URL.createObjectURL(blob);
          videoRef.current.src = url;
          setTimeout(() => URL.revokeObjectURL(url), 100);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStreamReady(false);
        setError('Failed to connect to stream');
      };

      ws.onclose = () => {
        console.log('Drone WebSocket closed');
        setStreamReady(false);
        setError('Disconnected from stream');
        setTimeout(() => {
          if (isActive && !isLoading && !showMap) {
            connectWebSocket();
          }
        }, 2000);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [isActive, isLoading, showMap]);

  // Fetch map when switching to map view
  const toggleView = async () => {
    setShowMap((prev) => !prev);
    
    if (!showMap) {
      try {
        const response = await fetch('http://localhost:5001/get-map');
        if (response.ok) {
          const text = await response.text(); // Get HTML content as text
          const blob = new Blob([text], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          setMapUrl(url);
        } else {
          throw new Error(`Failed to fetch map: ${response.statusText}`);
        }
      } catch (err) {
        console.error('Error fetching map:', err);
        setError('Error loading map');
        setMapUrl(''); // Reset to default or error state
      }
    } else {
      setMapUrl(''); // Clear map URL when switching back to camera
      if (error) setError(null); // Clear error when switching back
    }
  };

  return (
    <div className={`glass-panel h-full flex flex-col opacity-0 ${isActive ? 'animate-fade-in' : ''}`}>
      {!isFullScreen && (
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Live Drone Feed</h2>
        </div>
      )}

      <div className="flex-grow p-4 flex flex-col items-center justify-center relative overflow-hidden bg-black/30">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2Icon className="animate-spin text-robot-accent mb-3" size={40} />
            <p className="text-white/70">Establishing connection...</p>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {!showMap ? (
              <div className="w-full h-full rounded-md relative overflow-hidden">
                {streamReady ? (
                  <img
                    ref={videoRef}
                    alt="Drone feed"
                    className="w-full h-full object-cover"
                    onError={(e) => console.error('Image load error:', e)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1487887235947-a955ef187fcc"
                      alt="Drone feed placeholder"
                      className="w-full h-full object-cover"
                    />
                    {error && <p className="absolute text-red-500">{error}</p>}
                  </div>
                )}
                <div className="absolute top-0 left-0 w-full p-2 flex justify-between">
                  <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">LIVE</div>
                  <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">ALT: {coordinates.alt}</div>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-2 flex justify-between">
                  <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">LAT: {coordinates.lat}</div>
                  <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">LONG: {coordinates.long}</div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full rounded-md bg-gray-800 flex items-center justify-center relative">
                {mapUrl ? (
                  <iframe
                    ref={mapContainerRef}
                    src={mapUrl}
                    className="w-full h-full border-0"
                    title="Route Map"
                    onError={(e) => {
                      console.error('Iframe load error:', e);
                      setError('Failed to load map in iframe');
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Loader2Icon className="animate-spin text-white" size={40} />
                    <p className="text-white/70 ml-2">Loading map...</p>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                  </div>
                )}
                <div className="absolute top-0 left-0 w-full p-2 flex justify-between">
                  <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">ROUTE MAP</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {!isFullScreen && (
        <div className="p-3 border-t border-white/10 text-center">
          <button
            onClick={toggleView}
            className="console-button flex items-center justify-center mx-auto gap-2"
            disabled={isLoading}
          >
            {showMap ? (
              <>
                <CameraIcon size={16} />
                <span>Switch to Camera Feed</span>
              </>
            ) : (
              <>
                <MapIcon size={16} />
                <span>Switch to Route Map</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default DroneFeed;