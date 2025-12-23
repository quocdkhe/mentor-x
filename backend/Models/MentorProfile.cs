namespace backend.Models;

public partial class MentorProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    public string Biography { get; set; } = null!;
    public decimal PricePerHour { get; set; }

    public double AvgRating { get; set; }
    public int TotalRatings { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual User User { get; set; } = null!;
    public virtual ICollection<Skill> Skills { get; set; } = new List<Skill>();
    public virtual ICollection<MentorReview> MentorReviews { get; set; } = new List<MentorReview>();

}
