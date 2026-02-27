using backend.Models.DTOs.Booking;

namespace backend.Utils
{
    public static class GeneratePaymentCode
    {
        private static ulong Fnv1a64(string input)
        {
            const ulong offsetBasis = 14695981039346656037;
            const ulong prime = 1099511628211;

            ulong hash = offsetBasis;
            foreach (char c in input)
            {
                hash ^= c;
                hash *= prime;
            }

            return hash;
        }
        private static string ShortFromGuid(Guid guid, int length = 8)
        {
            const string chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

            ulong value = Fnv1a64(guid.ToString("N"));
            var result = new Stack<char>();

            while (value > 0)
            {
                result.Push(chars[(int)(value % 36)]);
                value /= 36;
            }

            return new string(result.ToArray())
                .PadLeft(length, '0')
                .Substring(0, length);
        }

        private static string GenerateAddInfo(BookingRequestDto dto)
        {
            var shortMentorId = ShortFromGuid(dto.MentorId);

            string startTime = dto.StartAt.ToString("HHmm");
            string endTime = dto.EndAt.ToString("HHmm");
            string date = dto.StartAt.ToString("ddMMyyyy");

            return $"MENTORX{shortMentorId}{startTime}{endTime}{date}";
        }
    }
}
