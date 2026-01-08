namespace backend.Models.DTOs.Mentor
{
    public class SkillDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Icon { get; set; }
    }
}
