using Microsoft.AspNetCore.WebUtilities;
using System.Net.Http.Headers;
using System.Text.Json;
using backend.Models;
using backend.Models.DTOs.Booking;
using backend.Services.Interfaces;
using backend.Utils;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly MentorXContext _context;

        public PaymentService(HttpClient httpClient, IConfiguration configuration, MentorXContext context)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _context = context;
        }

        private async Task<SepayResponseDto?> GetTransactionsAsync(int amountIn)
        {
            var apiEndpoint = _configuration["Sepay:ApiEndpoint"];
            var bearerToken = _configuration["Sepay:BearerToken"];

            if (string.IsNullOrEmpty(apiEndpoint) || string.IsNullOrEmpty(bearerToken))
                throw new InvalidOperationException("Sepay configuration is missing.");

            // Build today's date range
            var today = DateTime.Today;

            var dateMin = today.ToString("yyyy-MM-dd 00:00:00");
            var dateMax = today.ToString("yyyy-MM-dd 23:59:00");

            var query = new Dictionary<string, string?>
            {
                ["transaction_date_min"] = dateMin,
                ["transaction_date_max"] = dateMax,
                ["amount_in"] = amountIn.ToString()
            };

            var uri = QueryHelpers.AddQueryString(apiEndpoint, query);

            using var request = new HttpRequestMessage(HttpMethod.Get, uri);

            request.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", bearerToken);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            return JsonSerializer.Deserialize<SepayResponseDto>(json, options);
        }

        public async Task<bool> VerifyPayment(BookingRequestDto dto)
        {
            // todo: calculate price
            var mentor = await _context.MentorProfiles.Include(mp => mp.User)
                .FirstOrDefaultAsync(mp => mp.UserId == dto.MentorId);
            if (mentor == null)
            {
                return false;
            }
            decimal pricePerHour = mentor.PricePerHour;
            TimeSpan duration = dto.EndAt - dto.StartAt;
            decimal totalHours = (decimal)duration.TotalHours;

            // Optional: round to 2 decimal places
            totalHours = Math.Round(totalHours, 2);

            int totalPrice = decimal.ToInt32(totalHours * pricePerHour);
            var sepayResponse = await GetTransactionsAsync(totalPrice);

            //check key
            string key = GeneratePaymentCode.GenerateAddInfo(dto, mentor.User.Name);
            bool result = sepayResponse.Transactions.Any(tran => tran.TransactionContent.Contains(key));
            return result;
        }
    }
}
