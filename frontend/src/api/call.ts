import type { TurnCredential } from "@/types/call";
import api from "./api";

export async function fetchCallToken(
  sessionId: string,
): Promise<TurnCredential> {
  const res = await api.get<TurnCredential>(`/call/${sessionId}/token`);
  return res.data;
}
