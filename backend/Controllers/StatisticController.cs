using backend.Models.DTOs.Mentor;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    public class StatisticController : ControllerBase
    {
        private readonly IStatisticService _statisticService;

        public StatisticController(IStatisticService statisticService)
        {
            _statisticService = statisticService;
        }

        [HttpGet("statistics/payment-status")]
        public async Task<ActionResult<List<PaymentStatusDto>>> GetAllPaymentStatus([FromQuery] Guid? mentorId)
        {
            var result = await _statisticService.GetAllPaymentStatus(mentorId);
            return Ok(result);
        }

        /// <summary>Admin marks that the platform has transferred money to the mentor.</summary>
        [HttpPatch("statistics/mark-mentor-paid/{appointmentId}")]
        public async Task<ActionResult> MarkMentorPaid(Guid appointmentId)
        {
            await _statisticService.MarkMentorPaid(appointmentId);
            return Ok();
        }

        /// <summary>Records that the user (mentee) has paid the platform.</summary>
        [HttpPatch("statistics/mark-user-paid/{appointmentId}")]
        public async Task<ActionResult> MarkUserPaid(Guid appointmentId, [FromQuery] string? paymentCode)
        {
            await _statisticService.MarkUserPaid(appointmentId, paymentCode);
            return Ok();
        }
    }
}

