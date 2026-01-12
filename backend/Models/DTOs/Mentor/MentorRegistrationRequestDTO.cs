using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs.Mentor;

public class MentorRegistrationRequestDTO
{
    [Required]
    public string Biography { get; set; } = null!;

    [Required]
    public decimal PricePerHour { get; set; }

    [Required]
    [MaxLength(3)]
    public List<string> Skills { get; set; } = new List<string>();
}
