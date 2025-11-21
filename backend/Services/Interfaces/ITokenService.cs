using System.Security.Claims;

namespace backend.Services.Interfaces
{
    public interface ITokenService
    {
        string GenerateAccessToken(Models.User user);
        string GenerateRefreshToken();
        ClaimsPrincipal ValidateToken(string token);
    }
}
