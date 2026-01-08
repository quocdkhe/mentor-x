namespace backend.Models.DTOs.Mentor;

public class MentorUpdateRequestDTO
{
    public UserUpdateDTO? User { get; set; }
    public string? Biography { get; set; }
    public decimal? PricePerHour { get; set; }
    public List<string>? Skills { get; set; }
    public string? Employer { get; set; }
    public string? Company { get; set; }
    public int? YearsOfExperience { get; set; }
}

public class UserUpdateDTO
{
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Password { get; set; }
    public string? Avatar { get; set; }
}
