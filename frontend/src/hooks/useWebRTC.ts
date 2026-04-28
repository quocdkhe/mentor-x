import { useEffect, useRef, useState, type RefObject } from "react";
import type { HubConnection } from "@microsoft/signalr";
import type { CallStatus, TurnCredential } from "@/types/call";

export interface UseWebRTCParams {
  roomId: string;
  credential: TurnCredential;
  connectionRef: RefObject<HubConnection | null>;
  isInitiator: boolean;
}

export interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callStatus: CallStatus;
  isMuted: boolean;
  isVideoOff: boolean;
  toggleMute: () => void;
  toggleVideo: () => void;
  endCall: () => void;
}

type SignalRHandlers = {
  receiveOffer: (sdp: string) => Promise<void>;
  receiveAnswer: (sdp: string) => Promise<void>;
  receiveIceCandidate: (candidatePayload: string) => Promise<void>;
  userLeft: () => void;
};

function buildRtcConfiguration(credential: {
  turnHost: string;
  turnPort: number;
  turnUsername: string;
  turnCredential: string;
}): RTCConfiguration {
  return {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: `turn:${credential.turnHost}:${credential.turnPort}`,
        username: credential.turnUsername,
        credential: credential.turnCredential,
      },
    ],
  };
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function setTracksEnabled(
  stream: MediaStream | null,
  kind: "audio" | "video",
): boolean | null {
  if (!stream) {
    return null;
  }

  const tracks =
    kind === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();

  if (tracks.length === 0) {
    return null;
  }

  const nextEnabled = !tracks[0].enabled;

  tracks.forEach((track) => {
    track.enabled = nextEnabled;
  });

  return !nextEnabled;
}

function parseIceCandidate(
  candidatePayload: string,
): RTCIceCandidateInit | null {
  if (!candidatePayload) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(candidatePayload);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed as RTCIceCandidateInit;
  } catch {
    return null;
  }
}

function createRemoteStream() {
  return new MediaStream();
}

export function useWebRTC({
  roomId,
  credential,
  connectionRef,
  isInitiator,
}: UseWebRTCParams): UseWebRTCReturn {
  const { turnCredential, turnHost, turnPort, turnUsername } = credential;
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const joinedRoomRef = useRef(false);
  const endedRef = useRef(false);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const handlersRef = useRef<SignalRHandlers | null>(null);

  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection) {
      return;
    }

    let isCancelled = false;

    endedRef.current = false;
    joinedRoomRef.current = false;
    pendingIceCandidatesRef.current = [];
    peerConnectionRef.current = null;
    localStreamRef.current = null;
    remoteStreamRef.current = null;

    const releaseResources = () => {
      const peerConnection = peerConnectionRef.current;

      if (peerConnection) {
        peerConnection.ontrack = null;
        peerConnection.onicecandidate = null;
        peerConnection.onconnectionstatechange = null;
        peerConnection.oniceconnectionstatechange = null;
        peerConnection.close();
        peerConnectionRef.current = null;
      }

      stopStream(localStreamRef.current);
      localStreamRef.current = null;
      remoteStreamRef.current = null;
      pendingIceCandidatesRef.current = [];
      setLocalStream(null);
      setRemoteStream(null);
      setIsMuted(false);
      setIsVideoOff(false);
    };

    const detachHandlers = () => {
      const handlers = handlersRef.current;

      if (!handlers) {
        return;
      }

      connection.off("ReceiveOffer", handlers.receiveOffer);
      connection.off("ReceiveAnswer", handlers.receiveAnswer);
      connection.off("ReceiveIceCandidate", handlers.receiveIceCandidate);
      connection.off("UserLeft", handlers.userLeft);
      handlersRef.current = null;
    };

    const finalizeCall = async (
      notifyLeaveRoom: boolean,
      nextStatus: CallStatus,
    ) => {
      if (endedRef.current) {
        return;
      }

      endedRef.current = true;
      detachHandlers();

      if (notifyLeaveRoom && joinedRoomRef.current) {
        try {
          await connection.invoke("LeaveRoom", roomId);
        } catch {
          // Ignore teardown failures.
        } finally {
          joinedRoomRef.current = false;
        }
      }

      releaseResources();
      setCallStatus(nextStatus);
    };

    const flushPendingIceCandidates = async () => {
      const peerConnection = peerConnectionRef.current;

      if (!peerConnection?.remoteDescription) {
        return;
      }

      const pendingCandidates = pendingIceCandidatesRef.current;
      pendingIceCandidatesRef.current = [];

      for (const candidate of pendingCandidates) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    const handleIceCandidate = async (candidatePayload: string) => {
      const candidate = parseIceCandidate(candidatePayload);
      const peerConnection = peerConnectionRef.current;

      if (!candidate) {
        return;
      }

      if (!peerConnection?.remoteDescription) {
        pendingIceCandidatesRef.current.push(candidate);
        return;
      }

      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        void finalizeCall(false, "error");
      }
    };

    const handleOffer = async (sdp: string) => {
      const peerConnection = peerConnectionRef.current;

      if (!peerConnection || endedRef.current) {
        return;
      }

      try {
        setCallStatus("connecting");
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription({ type: "offer", sdp }),
        );
        await flushPendingIceCandidates();

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        if (answer.sdp) {
          await connection.invoke("SendAnswer", roomId, answer.sdp);
        }
      } catch {
        void finalizeCall(false, "error");
      }
    };

    const handleAnswer = async (sdp: string) => {
      const peerConnection = peerConnectionRef.current;

      if (!peerConnection || endedRef.current) {
        return;
      }

      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription({ type: "answer", sdp }),
        );
        await flushPendingIceCandidates();
      } catch {
        void finalizeCall(false, "error");
      }
    };

    const handleUserLeft = () => {
      void finalizeCall(false, "ended");
    };

    handlersRef.current = {
      receiveOffer: handleOffer,
      receiveAnswer: handleAnswer,
      receiveIceCandidate: handleIceCandidate,
      userLeft: handleUserLeft,
    };

    connection.on("ReceiveOffer", handleOffer);
    connection.on("ReceiveAnswer", handleAnswer);
    connection.on("ReceiveIceCandidate", handleIceCandidate);
    connection.on("UserLeft", handleUserLeft);

    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        if (isCancelled) {
          stopStream(stream);
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsMuted(false);
        setIsVideoOff(false);

        const peerConnection = new RTCPeerConnection(
          buildRtcConfiguration({
            turnCredential,
            turnHost,
            turnPort,
            turnUsername,
          }),
        );
        peerConnectionRef.current = peerConnection;

        const remote = createRemoteStream();
        remoteStreamRef.current = remote;
        setRemoteStream(remote);

        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        peerConnection.ontrack = (event) => {
          const nextRemoteStream = event.streams[0] ?? remoteStreamRef.current;

          if (!nextRemoteStream) {
            return;
          }

          if (!event.streams[0]) {
            nextRemoteStream.addTrack(event.track);
          }

          remoteStreamRef.current = nextRemoteStream;
          setRemoteStream(nextRemoteStream);
        };

        peerConnection.onicecandidate = (event) => {
          if (!event.candidate) {
            return;
          }

          void connection
            .invoke(
              "SendIceCandidate",
              roomId,
              JSON.stringify(event.candidate.toJSON()),
            )
            .catch(() => {
              void finalizeCall(false, "error");
            });
        };

        peerConnection.onconnectionstatechange = () => {
          if (peerConnection.connectionState === "connected") {
            setCallStatus("connected");
            return;
          }

          if (
            peerConnection.connectionState === "failed" ||
            peerConnection.connectionState === "disconnected"
          ) {
            void finalizeCall(false, "error");
            return;
          }

          if (
            peerConnection.connectionState === "closed" &&
            !endedRef.current
          ) {
            void finalizeCall(false, "ended");
          }
        };

        await connection.invoke("JoinRoom", roomId);
        joinedRoomRef.current = true;

        if (isInitiator) {
          setCallStatus("connecting");

          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);

          if (offer.sdp) {
            await connection.invoke("SendOffer", roomId, offer.sdp);
          }
        }
      } catch {
        if (!isCancelled) {
          await finalizeCall(false, "error");
        }
      }
    };

    void setup();

    return () => {
      isCancelled = true;
      detachHandlers();
      void finalizeCall(true, "ended");
    };
  }, [
    connectionRef,
    turnCredential,
    turnHost,
    turnPort,
    turnUsername,
    isInitiator,
    roomId,
  ]);

  const toggleMute = () => {
    const nextValue = setTracksEnabled(localStreamRef.current, "audio");

    if (nextValue !== null) {
      setIsMuted(nextValue);
    }
  };

  const toggleVideo = () => {
    const nextValue = setTracksEnabled(localStreamRef.current, "video");

    if (nextValue !== null) {
      setIsVideoOff(nextValue);
    }
  };

  const endCall = () => {
    void (async () => {
      endedRef.current = true;
      const handlers = handlersRef.current;
      const connection = connectionRef.current;
      if (handlers && connection) {
        connection.off("ReceiveOffer", handlers.receiveOffer);
        connection.off("ReceiveAnswer", handlers.receiveAnswer);
        connection.off("ReceiveIceCandidate", handlers.receiveIceCandidate);
        connection.off("UserLeft", handlers.userLeft);
        handlersRef.current = null;
      }

      if (connection && joinedRoomRef.current) {
        try {
          await connection.invoke("LeaveRoom", roomId);
        } catch {
          // Ignore teardown failures.
        } finally {
          joinedRoomRef.current = false;
        }
      }

      const peerConnection = peerConnectionRef.current;

      if (peerConnection) {
        peerConnection.close();
        peerConnectionRef.current = null;
      }

      stopStream(localStreamRef.current);
      localStreamRef.current = null;
      remoteStreamRef.current = null;
      pendingIceCandidatesRef.current = [];
      setLocalStream(null);
      setRemoteStream(null);
      setIsMuted(false);
      setIsVideoOff(false);
      setCallStatus("ended");
    })();
  };

  return {
    localStream,
    remoteStream,
    callStatus,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    endCall,
  };
}
