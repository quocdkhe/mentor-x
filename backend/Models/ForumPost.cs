namespace backend.Models;

public partial class ForumPost
{
    public Guid Id { get; set; }
    
    public string Content { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }
    
    public Guid UserId { get; set; }
    
    public Guid ForumTopicId { get; set; }

    public virtual User User { get; set; }
    
    public virtual ForumTopic ForumTopic { get; set; }
    
    public virtual ICollection<User> Likers { get; set; } = new List<User>();
}