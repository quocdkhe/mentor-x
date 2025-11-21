using backend.Models;

namespace backend.Services.Interfaces
{
    public interface IUserService
    {
        Task<User?> GetUserByEmail(string Email);

        Task<User?> GetUserById(Guid Id);
    }
}
