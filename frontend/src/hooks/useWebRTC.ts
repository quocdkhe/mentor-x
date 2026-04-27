import { useState, useRef, useCallback, useEffect } from 'react';

export type WebRTCState = 
  | 'idle' 
  | 'initializing' 
  | 'ready' 
  | 'connecting' 
  | 'connected' 
  | 'disconnected' 
  | 'failed';

export interface UseWebRTCConfig {
  iceServers: RTCIceServer[];
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onStateChange?: (state: WebRTCState) => void;
  onError?: (error: Error) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
}

export interface UseWebRTCReturn {
  state: WebRTCState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  initializeConnection: () => Promise<void>;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  createAnswer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>;
  setRemoteDescription: (description: RTCSessionDescriptionInit) => Promise<void>;
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  getLocalStream: (constraints?: MediaStreamConstraints) => Promise<MediaStream>;
  closeConnection: () => void;
  toggleAudio: () => boolean;
  toggleVideo: () => boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

export const useWebRTC = (config: UseWebRTCConfig): UseWebRTCReturn => {
  const [state, setState] = useState<WebRTCState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const configRef = useRef(config);
  
  // Keep config ref updated
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const updateState = useCallback((newState: WebRTCState) => {
    setState(newState);
    configRef.current.onStateChange?.(newState);
  }, []);

  const initializeConnection = useCallback(async () => {
    try {
      updateState('initializing');
      
      const pc = new RTCPeerConnection({
        iceServers: configRef.current.iceServers,
        iceCandidatePoolSize: 10,
      });

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          configRef.current.onIceCandidate?.(event.candidate);
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        switch (pc.connectionState) {
          case 'connected':
            updateState('connected');
            break;
          case 'disconnected':
            updateState('disconnected');
            break;
          case 'failed':
            updateState('failed');
            configRef.current.onError?.(new Error('Connection failed'));
            break;
          case 'connecting':
            updateState('connecting');
            break;
        }
      };

      // Handle incoming tracks (remote stream)
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setRemoteStream(remoteStream);
        configRef.current.onRemoteStream?.(remoteStream);
      };

      // Handle ICE gathering state
      pc.onicegatheringstatechange = () => {
        console.log('ICE gathering state:', pc.iceGatheringState);
      };

      peerConnectionRef.current = pc;
      updateState('ready');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to initialize WebRTC');
      configRef.current.onError?.(err);
      updateState('failed');
    }
  }, [updateState]);

  const getLocalStream = useCallback(async (constraints?: MediaStreamConstraints): Promise<MediaStream> => {
    try {
      const defaultConstraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints || defaultConstraints);
      localStreamRef.current = stream;
      setLocalStream(stream);
      configRef.current.onLocalStream?.(stream);
      
      // Add tracks to peer connection if it exists
      const pc = peerConnectionRef.current;
      if (pc && pc.signalingState !== 'closed') {
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
      }
      
      return stream;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to get local stream');
      configRef.current.onError?.(err);
      throw err;
    }
  }, []);

  const createOffer = useCallback(async (): Promise<RTCSessionDescriptionInit> => {
    const pc = peerConnectionRef.current;
    if (!pc) throw new Error('Peer connection not initialized');

    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      
      await pc.setLocalDescription(offer);
      return offer;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to create offer');
      configRef.current.onError?.(err);
      throw err;
    }
  }, []);

  const createAnswer = useCallback(async (offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> => {
    const pc = peerConnectionRef.current;
    if (!pc) throw new Error('Peer connection not initialized');

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      return answer;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to create answer');
      configRef.current.onError?.(err);
      throw err;
    }
  }, []);

  const setRemoteDescription = useCallback(async (description: RTCSessionDescriptionInit): Promise<void> => {
    const pc = peerConnectionRef.current;
    if (!pc) throw new Error('Peer connection not initialized');

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(description));
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to set remote description');
      configRef.current.onError?.(err);
      throw err;
    }
  }, []);

  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit): Promise<void> => {
    const pc = peerConnectionRef.current;
    if (!pc) throw new Error('Peer connection not initialized');
    if (pc.remoteDescription === null) {
      // Queue candidate if remote description not set yet
      setTimeout(() => addIceCandidate(candidate), 100);
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
      // Don't throw - ICE candidates can fail individually
    }
  }, []);

  const closeConnection = useCallback(() => {
    const pc = peerConnectionRef.current;
    if (pc) {
      pc.getSenders().forEach(sender => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      pc.close();
      peerConnectionRef.current = null;
    }

    // Stop all local tracks
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    updateState('idle');
  }, [updateState]);

  const toggleAudio = useCallback((): boolean => {
    const stream = localStreamRef.current;
    if (!stream) return false;

    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
      return audioTrack.enabled;
    }
    return false;
  }, []);

  const toggleVideo = useCallback((): boolean => {
    const stream = localStreamRef.current;
    if (!stream) return false;

    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
      return videoTrack.enabled;
    }
    return false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeConnection();
    };
  }, [closeConnection]);

  return {
    state,
    localStream,
    remoteStream,
    peerConnection: peerConnectionRef.current,
    initializeConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    getLocalStream,
    closeConnection,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled,
  };
};

export default useWebRTC;
