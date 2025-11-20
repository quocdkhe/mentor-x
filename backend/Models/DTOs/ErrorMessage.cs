namespace backend.Models.DTOs
{
    public class ErrorMessage
    {
        public string Message { get; set; } = null!;
        public ErrorMessage() { }
        public ErrorMessage(string message)
        {
            Message = message;
        }
    }
}
