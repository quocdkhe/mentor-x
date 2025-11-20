namespace backend.Models.DTOs.User
{
    public class RegisterDTO
    {
        public string Name { get; set; } = null!;

        public string? Phone { get; set; }

        public string Email { get; set; } = null!;

        public string Password { get; set; } = null!;

        public string? Avatar { get; set; }
    }
}
