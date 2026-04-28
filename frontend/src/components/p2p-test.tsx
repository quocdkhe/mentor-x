import { useEffect, useRef } from "react";
import { useSignalR } from "@/hooks/useSignalR";
import { useWebRTC } from "@/hooks/useWebRTC";
import { Button } from "@/components/ui/button";
import type { TurnCredential } from "@/types/call";

const ROOM_ID = "296199d4-22fb-4126-b92d-bc5a24d7d4b9";
const IS_INITIATOR = true; // change to false on the second tab

const FAKE_CREDENTIAL: TurnCredential = {
  roomId: ROOM_ID,
  turnHost: "quocdk.id.vn",
  turnPort: 3478,
  turnUsername: "1777480033:ae0b01a4-cdaa-49c9-a70a-caafcd0e89b3",
  turnCredential: "4UEIURcWiagKnBvadYQmse8skRg=",
  expiresAt: "2026-04-29T16:27:13.9106563+00:00",
};

function WebRTCTest() {
  const { connectionRef, status } = useSignalR(
    `${import.meta.env.VITE_API_URL}/hubs/call`
  );

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const { localStream, remoteStream, callStatus, isMuted, isVideoOff, toggleMute, toggleVideo, endCall } = useWebRTC({
    roomId: ROOM_ID,
    credential: FAKE_CREDENTIAL,
    connectionRef,
    isInitiator: IS_INITIATOR,
  });

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <p>SignalR: <strong>{status}</strong></p>
      <p>Call: <strong>{callStatus}</strong></p>
      <p>Muted: <strong>{String(isMuted)}</strong> | Video off: <strong>{String(isVideoOff)}</strong></p>
      <div className="flex gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Local</p>
          <video ref={localVideoRef} autoPlay muted playsInline width={300} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Remote</p>
          <video ref={remoteVideoRef} autoPlay playsInline width={300} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</Button>
        <Button onClick={toggleVideo}>{isVideoOff ? "Camera On" : "Camera Off"}</Button>
        <Button onClick={endCall} variant="destructive">End Call</Button>
      </div>
    </div>
  );
}

export default WebRTCTest;