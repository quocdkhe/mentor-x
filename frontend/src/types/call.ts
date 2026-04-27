export type CallStatus = 
  | 'Pending' 
  | 'Ringing' 
  | 'Connected' 
  | 'Ended' 
  | 'Failed' 
  | 'Rejected' 
  | 'Missed';

export type CallEndReason = 
  | 'UserInitiated' 
  | 'NetworkFailure' 
  | 'Timeout' 
  | 'Error';

export interface CallResponseDto {
  id: string;
  initiatorId: string;
  initiatorName: string;
  recipientId: string;
  recipientName: string;
  appointmentId?: string;
  status: CallStatus;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  durationSeconds: number;
  endReason?: CallEndReason;
  errorMessage?: string;
}

export interface CallStatisticsResponseDto {
  totalCalls: number;
  completedCalls: number;
  missedCalls: number;
  rejectedCalls: number;
  averageDurationSeconds: number;
  successRate: number;
}

export interface InitiateCallRequest {
  recipientId: string;
  appointmentId?: string;
}

export interface RejectCallRequest {
  reason?: string;
}

export interface EndCallRequest {
  reason?: string;
}

export interface IceServerDto {
  urls: string[];
  username?: string;
  credential?: string;
}

export interface IceConfigurationResponse {
  iceServers: IceServerDto[];
  callTimeoutSeconds: number;
  maxCallDurationSeconds: number;
}
