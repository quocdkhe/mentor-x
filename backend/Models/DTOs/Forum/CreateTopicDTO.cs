using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs.Forum;

public class CreateTopicDTO
{
    [Required]
    public string Topic { get; set; }
    
    [Required]
    public ForumTopicTypeEnum Type { get; set; } 

}