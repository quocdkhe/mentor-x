import { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import type { HubConnection } from "@microsoft/signalr";
import type { CallStatus } from "@/types/call";

interface UseSignalRResult {
  connectionRef: React.MutableRefObject<HubConnection | null>;
  status: CallStatus;
}

function mapHubState(state: HubConnectionState): CallStatus {
  switch (state) {
    case HubConnectionState.Connected:
      return "connected";
    case HubConnectionState.Connecting:
      return "connecting";
    case HubConnectionState.Reconnecting:
      return "reconnecting";
    case HubConnectionState.Disconnected:
    case HubConnectionState.Disconnecting:
      return "ended";
    default:
      return "error";
  }
}

export function useSignalR(hubUrl: string): UseSignalRResult {
  const [status, setStatus] = useState<CallStatus>("connecting");
  const connectionRef = useRef<HubConnection | null>(null);
  const isCancelledRef = useRef(false);

  useEffect(() => {
    if (!hubUrl) return;

    isCancelledRef.current = false;

    const conn = new HubConnectionBuilder()
      .withUrl(hubUrl, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = conn;

    conn.onreconnecting(() => {
      if (!isCancelledRef.current) setStatus("reconnecting");
    });

    conn.onreconnected(() => {
      if (!isCancelledRef.current) setStatus("connected");
    });

    conn.onclose(() => {
      if (!isCancelledRef.current) setStatus("ended");
    });

    void conn
      .start()
      .then(() => {
        if (!isCancelledRef.current) setStatus(mapHubState(conn.state));
      })
      .catch(() => {
        if (!isCancelledRef.current) setStatus("error");
      });

    return () => {
      isCancelledRef.current = true;
      connectionRef.current = null;
      void conn.stop();
    };
  }, [hubUrl]);

  return { connectionRef, status };
}
