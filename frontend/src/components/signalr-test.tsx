import { useEffect } from "react";
import { useSignalR } from "@/hooks/useSignalR";
import { Button } from "@/components/ui/button";

const ROOM_ID = "296199d4-22fb-4126-b92d-bc5a24d7d4b9";

function SignalRTest() {
  const { connectionRef, status } = useSignalR(
    `${import.meta.env.VITE_API_URL}/hubs/call`
  );

  useEffect(() => {
    const conn = connectionRef.current;
    if (!conn) return;

    conn.on("UserJoined", (userId: string) => console.log("[SignalR] ← UserJoined:", userId));
    conn.on("UserLeft", (userId: string) => console.log("[SignalR] ← UserLeft:", userId));
    conn.on("ReceiveOffer", (sdp: string) => console.log("[SignalR] ← ReceiveOffer:", sdp));

    return () => {
      conn.off("UserJoined");
      conn.off("UserLeft");
      conn.off("ReceiveOffer");
    };
  }, [status]); // re-run when connected

  const join = () => connectionRef.current?.invoke("JoinRoom", ROOM_ID)
    .then(() => console.log("[SignalR] JoinRoom sent"))
    .catch((err) => console.error("[SignalR] JoinRoom failed", err));

  const leave = () => connectionRef.current?.invoke("LeaveRoom", ROOM_ID)
    .then(() => console.log("[SignalR] LeaveRoom sent"))
    .catch((err) => console.error("[SignalR] LeaveRoom failed", err));

  return (
    <div className="flex flex-col gap-4 p-6 max-w-sm border rounded-lg">
      <p>Status: <strong>{status}</strong></p>
      <Button onClick={join} disabled={status !== "connected"}>Join Room</Button>
      <Button onClick={leave} disabled={status !== "connected"} variant="outline">Leave Room</Button>
    </div>
  );
}

export default SignalRTest;