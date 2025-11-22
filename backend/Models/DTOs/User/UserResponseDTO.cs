namespace backend.Models.DTOs.User
{
    public class UserResponseDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Phone { get; set; }
        public string Email { get; set; } = null!;
        public string? Avatar { get; set; }
        public string Role { get; set; } = null!;

    }
}
