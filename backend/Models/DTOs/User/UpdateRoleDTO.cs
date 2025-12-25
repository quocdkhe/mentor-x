namespace backend.Models.DTOs.User
{
    public class UpdateRoleDTO
    {
        public Guid Id { get; set; }
        public UserRole? Role { get; set; } = null!;

    }
}
