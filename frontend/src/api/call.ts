import api from "./api";
import type { 
  CallResponseDto, 
  CallStatisticsResponseDto, 
  InitiateCallRequest,
  RejectCallRequest,
  EndCallRequest,
  IceConfigurationResponse
} from "@/types/call"

export const callApi = {
  // Get ICE configuration for WebRTC
  getIceConfiguration: async (): Promise<IceConfigurationResponse> => {
    const { data } = await api.get<IceConfigurationResponse>("/api/calls/ice-configuration");
    return data;
  },

  // Initiate a new call
  initiateCall: async (request: InitiateCallRequest): Promise<CallResponseDto> => {
    const { data } = await api.post<CallResponseDto>("/api/calls/initiate", request);
    return data;
  },

  // Get call details
  getCall: async (callId: string): Promise<CallResponseDto> => {
    const { data } = await api.get<CallResponseDto>(`/api/calls/${callId}`);
    return data;
  },

  // Accept an incoming call
  acceptCall: async (callId: string): Promise<CallResponseDto> => {
    const { data } = await api.post<CallResponseDto>(`/api/calls/${callId}/accept`);
    return data;
  },

  // Reject an incoming call
  rejectCall: async (callId: string, request?: RejectCallRequest): Promise<CallResponseDto> => {
    const { data } = await api.post<CallResponseDto>(`/api/calls/${callId}/reject`, request);
    return data;
  },

  // End an active call
  endCall: async (callId: string, request?: EndCallRequest): Promise<CallResponseDto> => {
    const { data } = await api.post<CallResponseDto>(`/api/calls/${callId}/end`, request);
    return data;
  },

  // Get call history
  getCallHistory: async (limit = 50): Promise<CallResponseDto[]> => {
    const { data } = await api.get<CallResponseDto[]>("/api/calls/history", {
      params: { limit },
    });
    return data;
  },

  // Get call statistics
  getCallStatistics: async (): Promise<CallStatisticsResponseDto> => {
    const { data } = await api.get<CallStatisticsResponseDto>("/api/calls/statistics");
    return data;
  },

  // Get active calls
  getActiveCalls: async (): Promise<CallResponseDto[]> => {
    const { data } = await api.get<CallResponseDto[]>("/api/calls/active");
    return data;
  },
};

export default callApi;
