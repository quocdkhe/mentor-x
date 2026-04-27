import { useState, useRef, useCallback, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

export type CallSignalState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface IncomingCall {
  callId: string;
  initiatorId: string;
  initiatorName: string;
  bookingId?: string;
}

export interface ActiveCall {
  callId: string;
  initiatorId: string;
  recipientId: string;
  status: 'pending' | 'ringing' | 'connected' | 'ended';
  startedAt?: Date;
}

export interface UseCallSignalingConfig {
  hubUrl: string;
  accessToken: string;
  onIncomingCall?: (call: IncomingCall) => void;
  onCallAccepted?: (callId: string) => void;
  onCallRejected?: (callId: string, reason?: string) => void;
  onCallEnded?: (callId: string, reason?: string) => void;
  onOfferReceived?: (callId: string, sdpOffer: string) => void;
  onAnswerReceived?: (callId: string, sdpAnswer: string) => void;
  onIceCandidateReceived?: (callId: string, candidate: string, sdpMLineIndex: number, sdpMid: string) => void;
  onCallError?: (callId: string | null, errorMessage: string) => void;
}

export interface UseCallSignalingReturn {
  connectionState: CallSignalState;
  incomingCall: IncomingCall | null;
  activeCall: ActiveCall | null;
  connection: signalR.HubConnection | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  initiateCall: (recipientId: string, bookingId?: string) => Promise<void>;
  acceptCall: (callId: string) => Promise<void>;
  rejectCall: (callId: string, reason?: string) => Promise<void>;
  sendOffer: (callId: string, sdpOffer: string) => Promise<void>;
  sendAnswer: (callId: string, sdpAnswer: string) => Promise<void>;
  sendIceCandidate: (callId: string, candidate: RTCIceCandidate) => Promise<void>;
  endCall: (callId: string, reason?: string) => Promise<void>;
  clearIncomingCall: () => void;
}

export const useCallSignaling = (config: UseCallSignalingConfig): UseCallSignalingReturn => {
  const [connectionState, setConnectionState] = useState<CallSignalState>('disconnected');
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const configRef = useRef(config);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const setupConnectionHandlers = useCallback((connection: signalR.HubConnection) => {
    // Incoming call notification
    connection.on('CallIncoming', (callId: string, initiatorId: string, initiatorName: string, bookingId?: string) => {
      const call: IncomingCall = { callId, initiatorId, initiatorName, bookingId };
      setIncomingCall(call);
      configRef.current.onIncomingCall?.(call);
    });

    // Call accepted by recipient
    connection.on('CallAccepted', (callId: string) => {
      setActiveCall(prev => prev?.callId === callId 
        ? { ...prev, status: 'connected', startedAt: new Date() }
        : prev
      );
      configRef.current.onCallAccepted?.(callId);
    });

    // Call rejected by recipient
    connection.on('CallRejected', (callId: string, reason?: string) => {
      if (activeCall?.callId === callId) {
        setActiveCall(null);
      }
      configRef.current.onCallRejected?.(callId, reason);
    });

    // Call ended
    connection.on('CallEnded', (callId: string, reason?: string) => {
      if (incomingCall?.callId === callId) {
        setIncomingCall(null);
      }
      if (activeCall?.callId === callId) {
        setActiveCall(null);
      }
      configRef.current.onCallEnded?.(callId, reason);
    });

    // WebRTC signaling - Offer received
    connection.on('OfferReceived', (callId: string, sdpOffer: string) => {
      configRef.current.onOfferReceived?.(callId, sdpOffer);
    });

    // WebRTC signaling - Answer received
    connection.on('AnswerReceived', (callId: string, sdpAnswer: string) => {
      configRef.current.onAnswerReceived?.(callId, sdpAnswer);
    });

    // WebRTC signaling - ICE candidate received
    connection.on('IceCandidateReceived', (callId: string, candidate: string, sdpMLineIndex: number, sdpMid: string) => {
      configRef.current.onIceCandidateReceived?.(callId, candidate, sdpMLineIndex, sdpMid);
    });

    // Call error
    connection.on('CallError', (callId: string | null, errorMessage: string) => {
      configRef.current.onCallError?.(callId, errorMessage);
    });

    // Heartbeat response
    connection.on('Pong', () => {
      // Connection is alive
    });
  }, [incomingCall, activeCall]);

  const connect = useCallback(async () => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      setConnectionState('connecting');
      reconnectAttempts.current = 0;

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${configRef.current.hubUrl}?access_token=${configRef.current.accessToken}`, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount >= maxReconnectAttempts) {
              return null;
            }
            setConnectionState('reconnecting');
            reconnectAttempts.current = retryContext.previousRetryCount + 1;
            // Exponential backoff: 1s, 2s, 4s, 8s, 16s
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Connection closed handler
      connection.onclose((error) => {
        setConnectionState('disconnected');
        if (error) {
          console.error('SignalR connection closed with error:', error);
        }
      });

      // Reconnecting handler
      connection.onreconnecting((error) => {
        console.log('SignalR reconnecting...', error);
        setConnectionState('reconnecting');
      });

      // Reconnected handler
      connection.onreconnected((connectionId) => {
        console.log('SignalR reconnected with ID:', connectionId);
        setConnectionState('connected');
        reconnectAttempts.current = 0;
      });

      setupConnectionHandlers(connection);

      await connection.start();
      connectionRef.current = connection;
      setConnectionState('connected');
      reconnectAttempts.current = 0;

      // Start heartbeat
      startHeartbeat(connection);
    } catch (error) {
      console.error('SignalR connection error:', error);
      setConnectionState('error');
      throw error;
    }
  }, [setupConnectionHandlers]);

  const startHeartbeat = (connection: signalR.HubConnection) => {
    // Send ping every 30 seconds to keep connection alive
    const intervalId = setInterval(async () => {
      if (connection.state === signalR.HubConnectionState.Connected) {
        try {
          await connection.invoke('Ping');
        } catch {
          // Ping failed, connection might be dead
          clearInterval(intervalId);
        }
      } else {
        clearInterval(intervalId);
      }
    }, 30000);
  };

  const disconnect = useCallback(async () => {
    const connection = connectionRef.current;
    if (connection) {
      await connection.stop();
      connectionRef.current = null;
      setConnectionState('disconnected');
    }
  }, []);

  const initiateCall = useCallback(async (recipientId: string, bookingId?: string) => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection not established');
    }

    await connection.invoke('InitiateCall', recipientId, bookingId);
    
    // Set active call locally (will be confirmed by server)
    setActiveCall({
      callId: '', // Will be set when server responds
      initiatorId: 'me',
      recipientId,
      status: 'pending',
    });
  }, []);

  const acceptCall = useCallback(async (callId: string) => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection not established');
    }

    await connection.invoke('AcceptCall', callId);
    
    if (incomingCall?.callId === callId) {
      setActiveCall({
        callId,
        initiatorId: incomingCall.initiatorId,
        recipientId: 'me',
        status: 'connected',
        startedAt: new Date(),
      });
      setIncomingCall(null);
    }
  }, [incomingCall]);

  const rejectCall = useCallback(async (callId: string, reason?: string) => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection not established');
    }

    await connection.invoke('RejectCall', callId, reason);
    
    if (incomingCall?.callId === callId) {
      setIncomingCall(null);
    }
  }, [incomingCall]);

  const sendOffer = useCallback(async (callId: string, sdpOffer: string) => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection not established');
    }

    await connection.invoke('SendOffer', callId, sdpOffer);
  }, []);

  const sendAnswer = useCallback(async (callId: string, sdpAnswer: string) => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection not established');
    }

    await connection.invoke('SendAnswer', callId, sdpAnswer);
  }, []);

  const sendIceCandidate = useCallback(async (callId: string, candidate: RTCIceCandidate) => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection not established');
    }

    await connection.invoke(
      'SendIceCandidate',
      callId,
      candidate.candidate,
      candidate.sdpMLineIndex ?? 0,
      candidate.sdpMid ?? ''
    );
  }, []);

  const endCall = useCallback(async (callId: string, reason?: string) => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection not established');
    }

    await connection.invoke('EndCall', callId, reason);
    
    if (activeCall?.callId === callId) {
      setActiveCall(null);
    }
    if (incomingCall?.callId === callId) {
      setIncomingCall(null);
    }
  }, [activeCall, incomingCall]);

  const clearIncomingCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionState,
    incomingCall,
    activeCall,
    connection: connectionRef.current,
    connect,
    disconnect,
    initiateCall,
    acceptCall,
    rejectCall,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    endCall,
    clearIncomingCall,
  };
};

export default useCallSignaling;
