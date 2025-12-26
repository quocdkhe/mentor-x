namespace backend.Models.DTOs.Forum;

public class ForumTopicDto
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Type { get; set; }
    public DateTime DateCreated { get; set; }

    public AuthorDto Author { get; set; }

    public class AuthorDto
    {
        public string Name { get; set; }
        public string? Avatar { get; set; }
    }
}