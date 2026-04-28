export interface TurnCredential {
  roomId: string;
  turnHost: string;
  turnPort: number;
  turnUsername: string;
  turnCredential: string;
  expiresAt: string;
}

export interface CallParticipant {
  userId: string;
  displayName: string;
  role: "mentor" | "user";
}

export type CallStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "ended"
  | "error";
