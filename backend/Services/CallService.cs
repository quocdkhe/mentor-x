using System.Security.Cryptography;
using System.Text;
using backend.Middleware.Exceptions;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class CallService : ICallService
{
    private readonly MentorXContext _context;
    private readonly IConfiguration _configuration;

    public CallService(MentorXContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<Appointment> ValidateParticipant(string sessionId, string userId)
    {
        if (!Guid.TryParse(sessionId, out var appointmentId))
        {
            throw new BadRequestException("Session id không hợp lệ");
        }

        if (!Guid.TryParse(userId, out var currentUserId))
        {
            throw new UnauthorizedException("Invalid user id");
        }

        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (appointment == null)
        {
            throw new NotFoundException("Không tìm thấy cuộc hẹn");
        }

        if (appointment.Status != AppointmentStatusEnum.Confirmed)
        {
            throw new BadRequestException("Cuộc hẹn chưa được xác nhận");
        }

        if (appointment.MentorId != currentUserId && appointment.MenteeId != currentUserId)
        {
            throw new ForbiddenException("Bạn không phải là người tham gia cuộc hẹn này");
        }

        return appointment;
    }

    public TurnCredentialResult GenerateTurnCredential(string userId)
    {
        var secret = _configuration["Turn:Secret"];
        if (string.IsNullOrWhiteSpace(secret))
        {
            throw new InvalidOperationException("Turn secret is not configured");
        }

        var ttlSeconds = _configuration.GetValue<int?>("Turn:CredentialTtlSeconds") ?? 86400;
        if (ttlSeconds <= 0)
        {
            throw new InvalidOperationException("Turn credential TTL must be greater than zero");
        }

        var expiresAt = DateTimeOffset.UtcNow.AddSeconds(ttlSeconds);
        var username = $"{expiresAt.ToUnixTimeSeconds()}:{userId}";

        using var hmac = new HMACSHA1(Encoding.UTF8.GetBytes(secret));
        var credentialBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(username));
        var credential = Convert.ToBase64String(credentialBytes);

        return new TurnCredentialResult(username, credential, expiresAt);
    }
}

public sealed record TurnCredentialResult(string Username, string Credential, DateTimeOffset ExpiresAt);
