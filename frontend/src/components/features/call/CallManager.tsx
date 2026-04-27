import { useEffect, useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useCallSignaling } from '@/hooks/useCallSignaling';
import { callApi } from '@/api/call';
import { IncomingCallDialog } from './IncomingCallDialog';
import { CallWindow } from './CallWindow';
import { toast } from 'sonner';

export interface CallManagerProps {
  accessToken: string;
  userId: string;
  userName: string;
  apiUrl: string;
}

type CallPhase = 'idle' | 'calling' | 'receiving' | 'connected' | 'ending';

export interface CallManagerRef {
  initiateCall: (recipientId: string, bookingId?: string) => Promise<void>;
}

const CallManagerComponent = ({ accessToken, apiUrl }: CallManagerProps, ref: React.Ref<CallManagerRef>) => {
  const [callPhase, setCallPhase] = useState<CallPhase>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [remoteUserName, setRemoteUserName] = useState('');
  
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const iceConfigRef = useRef<RTCIceServer[]>([]);

  // Fetch ICE configuration on mount
  useEffect(() => {
    const fetchIceConfig = async () => {
      try {
        const config = await callApi.getIceConfiguration();
        iceConfigRef.current = config.iceServers.map((server: { urls: string[]; username?: string; credential?: string }) => ({
          urls: server.urls,
          username: server.username,
          credential: server.credential,
        }));
      } catch (error) {
        console.error('Failed to fetch ICE configuration:', error);
        // Fallback to default STUN servers
        iceConfigRef.current = [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ];
      }
    };
    fetchIceConfig();
  }, []);

  // WebRTC hook
  const {
    localStream,
    remoteStream,
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
  } = useWebRTC({
    iceServers: iceConfigRef.current,
    onLocalStream: () => console.log('Local stream acquired'),
    onRemoteStream: () => console.log('Remote stream acquired'),
    onStateChange: (state) => console.log('WebRTC state:', state),
    onError: (error) => {
      console.error('WebRTC error:', error);
      toast.error('Call error: ' + error.message);
    },
    onIceCandidate: (candidate) => {
      if (currentCallId) {
        signaling.sendIceCandidate(currentCallId, candidate);
      }
    },
  });

  // SignalR hook
  const signaling = useCallSignaling({
    hubUrl: `${apiUrl}/hubs/call-signaling`,
    accessToken,
    onIncomingCall: (call) => {
      console.log('Incoming call:', call);
      setRemoteUserName(call.initiatorName);
      setCurrentCallId(call.callId);
      setCallPhase('receiving');
    },
    onCallAccepted: async (_callId) => {
      console.log('Call accepted:', _callId);
      setCallPhase('connected');
      
      // Create offer if we're the initiator
      if (localStream && currentCallId) {
        try {
          const offer = await createOffer();
          await signaling.sendOffer(currentCallId, JSON.stringify(offer));
        } catch (error) {
          console.error('Failed to create offer:', error);
        }
      }
    },
    onCallRejected: (_callId, reason) => {
      console.log('Call rejected:', _callId, reason);
      toast.info(`Call rejected${reason ? ': ' + reason : ''}`);
      handleEndCall();
    },
    onCallEnded: (_callId, reason) => {
      console.log('Call ended:', _callId, reason);
      toast.info(`Call ended${reason ? ': ' + reason : ''}`);
      handleEndCall();
    },
    onOfferReceived: async (_callId, sdpOffer) => {
      console.log('Offer received:', _callId);
      if (!localStream) {
        await getLocalStream();
      }
      
      try {
        const offer = JSON.parse(sdpOffer);
        const answer = await createAnswer(offer);
        await signaling.sendAnswer(_callId, JSON.stringify(answer));
      } catch (error) {
        console.error('Failed to handle offer:', error);
      }
    },
    onAnswerReceived: async (_callId, sdpAnswer) => {
      console.log('Answer received:', _callId);
      try {
        const answer = JSON.parse(sdpAnswer);
        await setRemoteDescription(answer);
      } catch (error) {
        console.error('Failed to set remote description:', error);
      }
    },
    onIceCandidateReceived: async (_callId, candidate, sdpMLineIndex, sdpMid) => {
      try {
        await addIceCandidate({
          candidate,
          sdpMLineIndex,
          sdpMid,
        });
      } catch (error) {
        console.error('Failed to add ICE candidate:', error);
      }
    },
    onCallError: (_callId, errorMessage) => {
      console.error('Call error:', _callId, errorMessage);
      toast.error(errorMessage);
      handleEndCall();
    },
  });

  // Connect to SignalR on mount
  useEffect(() => {
    if (accessToken) {
      signaling.connect().catch(console.error);
    }
    return () => {
      signaling.disconnect();
    };
  }, [accessToken]);

  // Handle call duration timer
  useEffect(() => {
    if (callPhase === 'connected') {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      if (callPhase === 'idle') {
        setCallDuration(0);
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [callPhase]);

  // Expose initiateCall to parent via ref
  useImperativeHandle(ref, () => ({
    initiateCall: async (recipientId: string, bookingId?: string) => {
      try {
        // Ensure SignalR is connected
        if (signaling.connectionState !== 'connected') {
          await signaling.connect();
        }
        
        // Get local stream first
        await getLocalStream();
        
        // Initialize WebRTC connection
        await initializeConnection();
        
        // Create call via API
        const call = await callApi.initiateCall({ recipientId, appointmentId: bookingId });
        
        setCurrentCallId(call.id);
        setRemoteUserName(call.recipientName);
        setCallPhase('calling');
        
        // Send SignalR initiate message
        await signaling.initiateCall(recipientId, bookingId);
        
        toast.success('Calling...');
      } catch (error) {
        console.error('Failed to initiate call:', error);
        toast.error('Failed to start call');
        handleEndCall();
      }
    }
  }), [getLocalStream, initializeConnection, signaling, signaling.connectionState]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!currentCallId) return;
    
    try {
      // Get local stream
      await getLocalStream();
      
      // Initialize WebRTC
      await initializeConnection();
      
      // Accept via API
      await callApi.acceptCall(currentCallId);
      
      // Accept via SignalR
      await signaling.acceptCall(currentCallId);
      
      setCallPhase('connected');
      toast.success('Call connected');
    } catch (error) {
      console.error('Failed to accept call:', error);
      toast.error('Failed to accept call');
    }
  }, [currentCallId, getLocalStream, initializeConnection, signaling]);

  // Reject incoming call
  const rejectCall = useCallback(async () => {
    if (!currentCallId) return;
    
    try {
      await callApi.rejectCall(currentCallId);
      await signaling.rejectCall(currentCallId);
    } catch (error) {
      console.error('Failed to reject call:', error);
    }
    
    handleEndCall();
  }, [currentCallId, signaling]);

  // End call
  const handleEndCall = useCallback(async () => {
    if (currentCallId) {
      try {
        await callApi.endCall(currentCallId);
        await signaling.endCall(currentCallId);
      } catch (error) {
        console.error('Failed to end call:', error);
      }
    }
    
    closeConnection();
    setCallPhase('idle');
    setCurrentCallId(null);
    setIsMinimized(false);
    signaling.clearIncomingCall();
  }, [currentCallId, closeConnection, signaling]);

  // Minimize/Maximize call window
  const toggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  // Render based on call phase
  return (
    <>
      {/* Incoming Call Dialog */}
      <IncomingCallDialog
        isOpen={callPhase === 'receiving'}
        callerName={remoteUserName}
        onAccept={acceptCall}
        onReject={rejectCall}
      />

      {/* Active Call Window */}
      {(callPhase === 'calling' || callPhase === 'connected') && (
        <CallWindow
          localStream={localStream}
          remoteStream={remoteStream}
          callerName={remoteUserName}
          callDuration={callDuration}
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onEndCall={handleEndCall}
          isMinimized={isMinimized}
          onToggleMinimize={toggleMinimize}
        />
      )}
    </>
  );
}

export const CallManager = forwardRef(CallManagerComponent);

export default CallManager;
