namespace backend.Models.DTOs.User
{
    public class UserInfoResponseDTO
    {
        public string Name { get; set; } = null!;
        public string? Phone { get; set; }
        public string? Avatar { get; set; }
    }
}
