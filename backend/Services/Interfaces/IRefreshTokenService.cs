using backend.Models;

namespace backend.Services.Interfaces
{
    public interface IRefreshTokenService
    {
        Task SaveRefreshToken(Guid userId, string refreshToken);

        Task<RefreshToken?> GetValidRefreshToken(string refreshToken);

        Task RevokeToken(int tokenId);
    }
}
