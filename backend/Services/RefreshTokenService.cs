using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Routing.Template;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class RefreshTokenService : IRefreshTokenService
    {

        private readonly MentorXContext _context;

        public RefreshTokenService(MentorXContext context)
        {
            _context = context;
        }

        public async Task<RefreshToken?> GetValidRefreshToken(string refreshToken)
        {
            return await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken && rt.ExpiresAt >= DateTime.UtcNow);
        }

        public async Task SaveRefreshToken(Guid userId, string refreshToken)
        {
            var refreshTokenEntity = new RefreshToken
            {
                Token = refreshToken,
                UserId = userId,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
            };
            await _context.RefreshTokens.AddAsync(refreshTokenEntity);
            await _context.SaveChangesAsync();
        }

        public async Task RevokeToken(int tokenId)
        {
            var token = await _context.RefreshTokens.FindAsync(tokenId);
            if (token != null)
            {
                _context.RefreshTokens.Remove(token);
                await _context.SaveChangesAsync();
            }
        }
    }
}
