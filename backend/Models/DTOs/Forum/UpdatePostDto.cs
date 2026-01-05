namespace backend.Models.DTOs.Forum;

public class UpdatePostDto
{
    public Guid Id { get; set; }
    
    public string Content { get; set; } = string.Empty;
}