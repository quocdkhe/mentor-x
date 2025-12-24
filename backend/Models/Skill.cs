namespace backend.Models;

public partial class Skill
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;

    public virtual ICollection<MentorProfile> MentorProfiles { get; set; } = new List<MentorProfile>();
}
