using backend.Models.DTOs.Booking;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class PaymentService : IPaymentService
    {
        public Task VerifyPayment(BookingRequestDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
