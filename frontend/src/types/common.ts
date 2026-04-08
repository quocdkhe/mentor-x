export type Message = {
  message: string;
};

export type ErrorMessage = {
  statusCode: number;
  message: string;
  traceId?: string;
  timestamp: string;
};
