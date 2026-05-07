import { createLazyRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useEffect, type RefObject } from "react";
import { toast } from "sonner";
import { PhoneOff } from "lucide-react";
import type { HubConnection } from "@microsoft/signalr";
import type { RootState } from "@/store/store";
import { useSignalR } from "@/hooks/useSignalR";
import { useWebRTC } from "@/hooks/useWebRTC";
import { fetchCallToken } from "@/api/call";
import { USER_ROLES } from "@/types/user";
import type { TurnCredential } from "@/types/call";
import { VideoTile } from "@/components/features/call/VideoTile";
import { ControlsBar } from "@/components/features/call/ControlsBar";
import { CallStatusOverlay } from "@/components/features/call/CallStatusOverlay";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export const Route = createLazyRoute("/call/$sessionId")({
  component: CallRoomPage,
});

// --- Inner component: mounts WebRTC hooks only when credential is ready ---

interface CallRoomProps {
  credential: TurnCredential;
  connectionRef: RefObject<HubConnection | null>;
  isInitiator: boolean;
  localLabel: string;
  onNavigateBack: () => void;
}

function CallRoom({
  credential,
  connectionRef,
  isInitiator,
  localLabel,
  onNavigateBack,
}: CallRoomProps) {
  const {
    localStream,
    remoteStream,
    callStatus,
    isMuted,
    isVideoOff,
    isScreenSharing,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    endCall,
  } = useWebRTC({
    roomId: credential.roomId,
    credential,
    connectionRef,
    isInitiator,
  });

  useEffect(() => {
    if (callStatus === "ended") {
      toast.info("Cuộc gọi đã kết thúc");
      const timer = setTimeout(onNavigateBack, 2000);
      return () => clearTimeout(timer);
    }
  }, [callStatus, onNavigateBack]);

  useEffect(() => {
    if (callStatus !== "reconnecting") return;
    const id = toast.loading("Đang kết nối lại...");
    return () => { toast.dismiss(id); };
  }, [callStatus]);

  const showOverlay =
    callStatus === "connecting" ||
    callStatus === "ended" ||
    callStatus === "error";

  return (
    <div className="fixed inset-0 flex flex-col bg-zinc-900">
      {/* Video area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Primary: remote video (fills the area) */}
        <VideoTile
          stream={remoteStream}
          label="Đối tác"
          size="primary"
          objectFit="contain"
        />

        {/* Secondary: local video (bottom-right corner) */}
        <div className="absolute bottom-4 right-4 overflow-hidden rounded-xl shadow-lg ring-2 ring-white/20">
          <VideoTile
            stream={localStream}
            label={isScreenSharing ? "Màn hình" : localLabel}
            isMuted={isMuted}
            isVideoOff={isVideoOff && !isScreenSharing}
            objectFit={isScreenSharing ? "contain" : "cover"}
            size="secondary"
          />
        </div>

        {/* Status overlay */}
        {showOverlay && (
          <CallStatusOverlay
            status={callStatus as "connecting" | "ended" | "error"}
            onBack={callStatus !== "connecting" ? onNavigateBack : undefined}
          />
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-center bg-zinc-950 py-6">
        <ControlsBar
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          toggleMute={toggleMute}
          toggleVideo={toggleVideo}
          toggleScreenShare={toggleScreenShare}
          endCall={endCall}
        />
      </div>
    </div>
  );
}

// --- Outer component: resolves token and renders loading / error / call ---

function CallRoomPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const hubUrl = `${import.meta.env.VITE_API_URL}/hubs/call`;
  const { connectionRef } = useSignalR(hubUrl);

  const {
    data: credential,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["call-token", sessionId],
    queryFn: () => fetchCallToken(sessionId),
    retry: false,
    staleTime: Infinity,          // never re-fetch mid-call — new credential = new effect deps = call ends
    refetchOnWindowFocus: false,  // returning to the tab must not trigger a re-fetch
  });

  const navigateBack = () => {
    const to =
      user?.role === USER_ROLES.MENTOR
        ? "/mentor/schedules"
        : "/user/schedules";
    void navigate({ to });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-900">
        <div className="flex flex-col items-center gap-4 text-white">
          <Spinner className="h-10 w-10" />
          <p>Đang tải thông tin cuộc gọi...</p>
        </div>
      </div>
    );
  }

  if (isError || !credential) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-zinc-900 text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600">
          <PhoneOff className="h-8 w-8" />
        </div>
        <p className="text-lg">Không thể tham gia cuộc gọi.</p>
        <Button variant="outline" onClick={navigateBack}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <CallRoom
      credential={credential}
      connectionRef={connectionRef}
      isInitiator={user?.role === USER_ROLES.USER}
      localLabel={user?.name ?? "Bạn"}
      onNavigateBack={navigateBack}
    />
  );
}
