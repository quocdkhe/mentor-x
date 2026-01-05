namespace backend.Models.DTOs.User
{
    public class AdminCreateUserDTO
    {
        public string Name { get; set; } = null!;
        public string? Phone { get; set; }
        public string Email { get; set; } = null!;
        public string? Avatar { get; set; }
        public UserRole? Role { get; set; } = null!;

    }
}
