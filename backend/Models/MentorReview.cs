namespace backend.Models;

public partial class MentorReview
{
    public Guid Id { get; set; }
    public Guid MentorId { get; set; }
    public Guid MenteeId { get; set; }
    public Guid AppointmentId { get; set; }
    public int Rating { get; set; }          // 1-5
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual User Mentor { get; set; } = null!;
    public virtual User Mentee { get; set; } = null!;
    public virtual Appointment Appointment { get; set; } = null!;
    public virtual ICollection<User> Upvoters { get; set; } = new List<User>();
}
