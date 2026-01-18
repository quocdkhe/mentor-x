namespace backend.Models.DTOs.Mentor
{
    public class AvailabilityResponseDTO
    {
        public WeekDayEnum DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsActive { get; set; }
    }
}