using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs.Review;

public class CreateReviewRequestDTO
{
    [Required(ErrorMessage = "AppointmentId là bắt buộc")]
    public Guid AppointmentId { get; set; }

    [Required(ErrorMessage = "Rating là bắt buộc")]
    [Range(1, 5, ErrorMessage = "Rating phải từ 1 đến 5")]
    public int Rating { get; set; }

    [MaxLength(1000, ErrorMessage = "Comment không được vượt quá 1000 ký tự")]
    public string? Comment { get; set; }
}
