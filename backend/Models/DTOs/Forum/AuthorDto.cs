namespace backend.Models.DTOs.Forum;

public class AuthorDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public string Role { get; set; } = string.Empty;
}