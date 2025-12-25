namespace backend.Models;

public partial class ForumTopic
{
    public Guid Id { get; set; }

    public string Topic { get; set; }
    
    public ForumTopicTypeEnum Type { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }
    
    public Guid UserId { get; set; }
    
    public virtual User User { get; set; } 
}