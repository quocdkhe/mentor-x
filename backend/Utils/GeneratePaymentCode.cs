using backend.Models.DTOs.Booking;
using System.Globalization;
using System.Text;
namespace backend.Utils
{
    public static class GeneratePaymentCode
    {
        public static string RemoveDiacritics(string text)
        {
            var normalized = text.Normalize(NormalizationForm.FormD);
            return string.Concat(normalized
                .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark))
                .Normalize(NormalizationForm.FormC)
                .Replace("đ", "d")
                .Replace("Đ", "D");
        }

        public static string GenerateAddInfo(BookingRequestDto dto, string mentorName)
        {
            // Convert to Indochina Time (UTC+7)
            var startAtLocal = dto.StartAt.AddHours(7);
            var endAtLocal = dto.EndAt.AddHours(7);

            string startTime = startAtLocal.ToString("HHmm");
            string endTime = endAtLocal.ToString("HHmm");
            string date = startAtLocal.ToString("ddMMyyyy");

            return $"MENTORX {RemoveDiacritics(mentorName)} {startTime} {endTime} {date}";
        }
    }
}
