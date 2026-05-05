import { useEffect, useRef } from "react";
import { VideoOff } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface VideoTileProps {
  stream: MediaStream | null;
  label: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  size: "primary" | "secondary";
}

export function VideoTile({
  stream,
  label,
  isMuted,
  isVideoOff,
  size,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasTracks = (stream?.getTracks().length ?? 0) > 0;
  const showPlaceholder = !hasTracks || isVideoOff;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-xl bg-zinc-800",
        size === "primary" ? "h-full w-full" : "h-[150px] w-[200px] md:h-[180px] md:w-[240px]",
      )}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={size === "secondary"}
        className={cn("h-full w-full object-cover", showPlaceholder && "hidden")}
      />

      {showPlaceholder && (
        <div className="flex flex-col items-center gap-2 text-zinc-400">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-zinc-700 text-xl text-zinc-200">
              {label.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isVideoOff && (
            <span className="flex items-center gap-1 text-xs">
              <VideoOff className="h-3 w-3" />
              Camera tắt
            </span>
          )}
        </div>
      )}

      <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
        {label}
        {isMuted && " (tắt tiếng)"}
      </div>
    </div>
  );
}
