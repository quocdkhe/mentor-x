namespace backend.Models.DTOs;

public class PaginationDTO<T>
{
    public IReadOnlyList<T> Items { get; init; } = [];
    public int CurrentPage { get; init; }
    public int PageSize { get; init; }
    public int TotalItems { get; init; }
    public int TotalPages { get; init; }

    public bool HasNext => CurrentPage < TotalPages;
    public bool HasPrevious => CurrentPage > 1;
}
