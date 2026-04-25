namespace backend.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<bool> VerifyPayment(Guid appointmentId);
    }
}
