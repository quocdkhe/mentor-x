namespace backend.Models.DTOs.Forum;

public class ForumTopicDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public DateTime DateCreated { get; set; }
    public AuthorDto Author { get; set; }
}