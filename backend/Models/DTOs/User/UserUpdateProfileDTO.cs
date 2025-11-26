namespace backend.Models.DTOs.User
{
    public class UserUpdateProfileDTO
    {
        public string Name { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string? Password { get; set; }
        public string Avatar { get; set; } = null!;
    }
}
