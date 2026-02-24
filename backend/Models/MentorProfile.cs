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
    public string? Company { get; set; }
    public int YearsOfExperience { get; set; }
    public string? Position { get; set; }
    public bool IsVerified { get; set; }
    public string BankAccountNumber { get; set; } = null!;
    public string BankName { get; set; } = null!;
    public string Status { get; set; } = null!;
    public virtual User User { get; set; } = null!;
    public virtual ICollection<Skill> MentorSkills { get; set; } = new List<Skill>();

}
