using backend.Models.DTOs.Booking;

namespace backend.Services.Interfaces;

public interface IGoogleCalendarService
{
    Task<GoogleMeetingResult> CreateMeetingAsync(string accessToken,
        DateTime startTimeUtc,
        DateTime endTimeUtc,
        string mentorEmail,
        string menteeEmail);
}