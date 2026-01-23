namespace backend.Models.DTOs.Mentor
{
    public class MentorListItemDTO
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = null!;
        public string? Avatar { get; set; }
        public string Biography { get; set; } = null!;
        public List<string> Skills { get; set; } = new();
        public double AvgRating { get; set; }
        public int TotalRatings { get; set; }
        public decimal PricePerHour { get; set; }
        public string? Position { get; set; }
        public string? Company { get; set; }
        public int YearsOfExperience { get; set; }
        public bool HasMet { get; set; }
    }
}
