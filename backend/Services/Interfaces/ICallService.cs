using backend.Models;

namespace backend.Services.Interfaces;

public interface ICallService
{
    Task<Appointment> ValidateParticipant(string sessionId, string userId);
    TurnCredentialResult GenerateTurnCredential(string userId);
}
