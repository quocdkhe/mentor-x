import { useEffect, useRef } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface CallWindowProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callerName: string;
  callDuration: number;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export function CallWindow({
  localStream,
  remoteStream,
  callerName,
  callDuration,
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
  isMinimized = false,
  onToggleMinimize,
}: CallWindowProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Set up local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set up remote video
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Card className="p-3 flex items-center gap-3 shadow-lg">
          <div className="relative w-16 h-12 rounded overflow-hidden bg-black">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <span className="text-xs text-white">Connecting...</span>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{callerName}</span>
            <span className="text-xs text-muted-foreground">{formatDuration(callDuration)}</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggleMinimize}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={onEndCall}
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 bg-black flex flex-col"
      >
        {/* Remote Video (Full Screen) */}
        <div className="relative flex-1">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gray-700 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl text-white">{callerName.charAt(0).toUpperCase()}</span>
                </div>
                <p className="text-white text-lg">{callerName}</p>
                <p className="text-gray-400 text-sm mt-2">Connecting...</p>
              </div>
            </div>
          )}

          {/* Call Info Overlay */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-white font-medium">{callerName}</p>
              <p className="text-white/80 text-sm">{formatDuration(callDuration)}</p>
            </div>
            
            {onToggleMinimize && (
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 text-white hover:bg-black/70"
                onClick={onToggleMinimize}
              >
                <Minimize2 className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Local Video (Picture in Picture) */}
          <div className="absolute bottom-24 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-lg bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <VideoOff className="h-8 w-8 text-white/60" />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-900 p-6">
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="lg"
              className={`rounded-full h-14 w-14 p-0 ${
                !isAudioEnabled ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/10 border-white/20 text-white'
              }`}
              onClick={onToggleAudio}
            >
              {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>

            <Button
              variant="destructive"
              size="lg"
              className="rounded-full h-16 w-16 p-0"
              onClick={onEndCall}
            >
              <PhoneOff className="h-7 w-7" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className={`rounded-full h-14 w-14 p-0 ${
                !isVideoEnabled ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/10 border-white/20 text-white'
              }`}
              onClick={onToggleVideo}
            >
              {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CallWindow;
