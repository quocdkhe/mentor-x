import { Mic, MicOff, Monitor, PhoneOff, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ControlsBarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  endCall: () => void;
}

export function ControlsBar({
  isMuted,
  isVideoOff,
  isScreenSharing,
  toggleMute,
  toggleVideo,
  toggleScreenShare,
  endCall,
}: ControlsBarProps) {
  return (
    <div className="flex items-center justify-center gap-4 rounded-2xl bg-black/60 px-6 py-4 backdrop-blur-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className={cn(
          "h-12 w-12 rounded-full text-white hover:text-white",
          isMuted
            ? "bg-red-600 hover:bg-red-700"
            : "bg-zinc-700 hover:bg-zinc-600",
        )}
      >
        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleVideo}
        className={cn(
          "h-12 w-12 rounded-full text-white hover:text-white",
          isVideoOff
            ? "bg-red-600 hover:bg-red-700"
            : "bg-zinc-700 hover:bg-zinc-600",
        )}
      >
        {isVideoOff ? (
          <VideoOff className="h-5 w-5" />
        ) : (
          <Video className="h-5 w-5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleScreenShare}
        className={cn(
          "h-12 w-12 rounded-full text-white hover:text-white",
          isScreenSharing
            ? "bg-green-600 hover:bg-green-700"
            : "bg-zinc-700 hover:bg-zinc-600",
        )}
      >
        <Monitor className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={endCall}
        className="h-12 w-12 rounded-full bg-red-600 text-white hover:bg-red-700 hover:text-white"
      >
        <PhoneOff className="h-5 w-5" />
      </Button>
    </div>
  );
}
