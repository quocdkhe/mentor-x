namespace backend.Models.DTOs.Review;

public class MentorReviewResponseDTO
{
    public Guid Id { get; set; }
    
    public string MenteeName { get; set; } = null!;
    
    public string? MenteeAvatar { get; set; }
    
    public DateTime AppointmentStartAt { get; set; }
    
    public DateTime AppointmentEndAt { get; set; }
    
    public int Rating { get; set; }
    
    public string? Comment { get; set; }
    
    public int UpvoteCount { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public bool IsUpvotedByCurrentUser { get; set; }
}
