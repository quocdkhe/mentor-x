using backend.Models.DTOs.User;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs.Mentor;

public class MentorRegistrationRequestDTO
{
    [Required]
    public string Biography { get; set; } = null!;

    [Required]
    public decimal PricePerHour { get; set; }

    [Required]
    public string Position { get; set; } = null!;

    [Required]
    public string Company { get; set; } = null!;

    [Required]
    public int YearsOfExperience { get; set; }

    [Required]
    [MaxLength(3)]
    public List<string> Skills { get; set; } = new List<string>();

    public MentorRegistrationUserInfo? User { get; set; }

    public class MentorRegistrationUserInfo
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Avatar { get; set; } = null!;
    }
}
