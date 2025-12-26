namespace backend.Models.DTOs;

public class PaginationDto<T>
{
    public List<T> Items { get; init; } = new();
    
    public int CurrentPage { get; init; }
    
    public int PageSize { get; init; }
    
    public int TotalItems { get; init; }
    
    public int TotalPages { get; init; }

    public bool HasNext => CurrentPage < TotalPages;
    
    public bool HasPrevious => CurrentPage > 1;
}
