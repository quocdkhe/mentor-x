using backend.Models.DTOs.User;

namespace backend.Models.DTOs.Mentor;

public class MentorUpdateRequestDTO
{
    public UserUpdateProfileDTO? User { get; set; }
    public string? Biography { get; set; }
    public decimal? PricePerHour { get; set; }
    public List<string>? Skills { get; set; }
    public string? Employer { get; set; }
    public string? Company { get; set; }
    public int? YearsOfExperience { get; set; }
    public string? Position { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankName { get; set; }
}

