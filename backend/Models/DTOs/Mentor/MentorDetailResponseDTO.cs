namespace backend.Models.DTOs.Mentor
{
    public class MentorDetailResponseDTO : MentorListItemDTO
    {
        public List<MentorReviewDTO> Reviews { get; set; } = new();
        public double MeetingHours { get; set; }
    }
}
