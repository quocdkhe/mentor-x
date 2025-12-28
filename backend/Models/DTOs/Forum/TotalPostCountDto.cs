namespace backend.Models.DTOs.Forum;

public class TotalPostCountDto
{
    public int TotalCount { get; set; }
    
    public TotalPostCountDto(int totalCount)
    {
        TotalCount = totalCount;
    }
}