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
        private static string ShortName(string name)
        {
            name = RemoveDiacritics(name);

            var w = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var last = char.ToUpper(w[^1][0]) + w[^1][1..];
            var init = "";
            for (int i = 0; i < w.Length - 1; i++) init += char.ToUpper(w[i][0]);
            return last + init;
        }

        public static string GenerateAddInfo(BookingRequestDto dto, string mentorName)
        {
            // Convert to Indochina Time (UTC+7)
            var startAtLocal = dto.StartAt.AddHours(7);
            var endAtLocal = dto.EndAt.AddHours(7);

            string startTime = startAtLocal.ToString("HHmm");
            string endTime = endAtLocal.ToString("HHmm");
            string date = startAtLocal.ToString("ddMMyyyy");

            return $"MENTORX {ShortName(mentorName)} {startTime} {endTime} {date}";
        }
    }
}
