namespace backend.Models;

public partial class MentorReview
{
    public Guid Id { get; set; }
    public Guid MentorProfileId { get; set; }
    public Guid UserId { get; set; }
    public int Rating { get; set; }          // 1-5
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual MentorProfile MentorProfile { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
