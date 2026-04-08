namespace backend.Models.DTOs
{
    public class ErrorResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? TraceId { get; set; }
        public DateTime Timestamp { get; set; }

        public ErrorResponse(int statusCode, string message, string? traceId = null)
        {
            StatusCode = statusCode;
            Message = message;
            TraceId = traceId;
            Timestamp = DateTime.UtcNow;
        }
    }
}
