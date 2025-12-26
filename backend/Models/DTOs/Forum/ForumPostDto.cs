namespace backend.Models.DTOs.Forum;

public class ForumPostDto
{
    public string Id { get; set; }

    public AuthorDto Author { get; set; } = null!;

    public string Content { get; set; } = string.Empty;

    public string Timestamp { get; set; } = string.Empty;

    public List<LikeDto> Likes { get; set; } = new();

    // ---------- nested DTOs ----------
    public class AuthorDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string Role { get; set; } = string.Empty;
    }

    public class LikeDto
    {
        public string Name { get; set; } = string.Empty;
    }
}