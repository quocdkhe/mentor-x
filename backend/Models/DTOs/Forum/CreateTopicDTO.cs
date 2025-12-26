namespace backend.Models.DTOs.Forum;

public class CreateTopicDTO
{
    public string Topic { get; set; }
    
    public ForumTopicTypeEnum Type { get; set; }
    
}