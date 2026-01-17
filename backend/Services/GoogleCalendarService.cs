using backend.Models.DTOs.Booking;
using backend.Services.Interfaces;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;

namespace backend.Services;

public class GoogleCalendarService : IGoogleCalendarService
{
    public async Task<GoogleMeetingResult> CreateMeetingAsync(
            string accessToken,
            DateTime startTimeUtc,
            DateTime endTimeUtc,
            string mentorEmail,
            string menteeEmail
        )
        {
            var calendarService = new CalendarService(new BaseClientService.Initializer
            {
                HttpClientInitializer = GoogleCredential
                    .FromAccessToken(accessToken),
                ApplicationName = "MentorX"
            });

            var calendarEvent = new Event
            {
                Summary = "Mentoring Meeting",
                Description = "Online mentoring via Google Meet",
                Start = new EventDateTime
                {
                    DateTime = startTimeUtc,
                    TimeZone = "UTC"
                },
                End = new EventDateTime
                {
                    DateTime = endTimeUtc,
                    TimeZone = "UTC"
                },
                Attendees = new List<EventAttendee>
                {
                    new() { Email = mentorEmail },
                    new() { Email = menteeEmail }
                },
                ConferenceData = new ConferenceData
                {
                    CreateRequest = new CreateConferenceRequest
                    {
                        RequestId = Guid.NewGuid().ToString(),
                        ConferenceSolutionKey = new ConferenceSolutionKey
                        {
                            Type = "hangoutsMeet"
                        }
                    }
                }
            };

            var request = calendarService.Events.Insert(calendarEvent, "primary");
            request.ConferenceDataVersion = 1;

            var createdEvent = await request.ExecuteAsync();

            return new GoogleMeetingResult
            {
                MeetLink = createdEvent.HangoutLink,
                CalendarLink = createdEvent.HtmlLink
            };
        }
}