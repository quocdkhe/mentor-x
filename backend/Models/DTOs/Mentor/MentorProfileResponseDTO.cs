using backend.Models.DTOs.User;

namespace backend.Models.DTOs.Mentor
{
    public class MentorProfileResponseDTO
    {
        public UserInfoResponseDTO User { get; set; } = new();
        public string Biography { get; set; } = null!;
        public decimal PricePerHour { get; set; }
        public List<Guid> Skills { get; set; } = new();
        public string? Company { get; set; }
        public int YearsOfExperience { get; set; }
        public string? Position { get; set; }
    }

}
