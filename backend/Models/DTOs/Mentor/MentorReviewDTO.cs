namespace backend.Models.DTOs.Mentor
{
    public class MentorReviewDTO
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = null!;
        public string? UserAvatar { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime Date { get; set; }
    }
}
