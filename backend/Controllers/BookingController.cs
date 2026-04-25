using backend.Models.DTOs;
using backend.Models.DTOs.Booking;
using backend.Models;
using backend.Services.Interfaces;
using backend.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

public class BookingController : ControllerBase
{

    private readonly IBookingService _bookingService;
    private readonly IPaymentService _paymentService;
    private readonly IStatisticService _statisticService;
    private readonly MentorXContext _context;
    
    public BookingController(
        IBookingService bookingService,
        IPaymentService paymentService,
        IStatisticService statisticService,
        MentorXContext context)
    {
        _bookingService = bookingService;
        _paymentService = paymentService;
        _statisticService = statisticService;
        _context = context;
    }

    [HttpPost("appointments")]
    [Authorize(Roles = Roles.User)]
    public async Task<ActionResult<BookingCreatedResponseDto>> BookAnAppointment([FromBody] BookingRequestDto dto)
    {
        var userId = User.GetUserId();
        var result = await _bookingService.BookAnAppointment(userId, dto);
        return Ok(result);
    }

    [HttpPost("appointments/{appointmentId}/verify-payment")]
    [Authorize(Roles = Roles.User)]
    public async Task<ActionResult<Message>> VerifyPayment(Guid appointmentId)
    {
        var menteeId = User.GetUserId();
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == appointmentId && a.MenteeId == menteeId);

        if (appointment == null)
        {
            return NotFound(new Message("Không tìm thấy cuộc hẹn"));
        }

        var isPaid = await _paymentService.VerifyPayment(appointmentId);
        if (!isPaid)
        {
            return BadRequest(new Message("Chưa ghi nhận thanh toán"));
        }

        await _statisticService.MarkUserPaid(appointmentId, null);
        return Ok(new Message("Đã xác nhận thanh toán thành công"));
    }

    [HttpGet("/mentors/me/appointments")]
    [Authorize(Roles = Roles.Mentor)]
    public async Task<ActionResult<List<MentorAppointmentDto>>> GetMentorAppointments([FromQuery] DateTime? date)
    {
        var mentorId = User.GetUserId();
        var result = await _bookingService.GetMentorAppointments(mentorId, date);
        return Ok(result);
    }

    [HttpGet("/mentees/me/appointments")]
    [Authorize(Roles = Roles.User)]
    public async Task<ActionResult<List<MenteeAppointmentDto>>> GetMenteeAppointments([FromQuery] DateTime? date)
    {
        var menteeId = User.GetUserId();
        var result = await _bookingService.GetMenteeAppointments(menteeId, date);
        return Ok(result);
    }

    [HttpGet("appointments/{appointmentId}/payment-detail")]
    [Authorize(Roles = Roles.User)]
    public async Task<ActionResult<AppointmentPaymentDetailDto>> GetAppointmentPaymentDetail(Guid appointmentId)
    {
        var menteeId = User.GetUserId();
        var result = await _bookingService.GetAppointmentPaymentDetail(menteeId, appointmentId);
        return Ok(result);
    }

    [HttpGet("/mentors/{mentorId}/schedules")]
    public async Task<ActionResult<MentorScheduleDto>> GetMentorSchedules(Guid mentorId, [FromQuery] DateTime? date)
    {
        var result = await _bookingService.GetMentorSchedule(mentorId, date);
        return Ok(result);
    }

    [HttpPost("appointments/{appointmentId}/accept")]
    [Authorize(Roles = Roles.Mentor)]
    public async Task<ActionResult<Message>> AcceptAppointment(Guid appointmentId ,[FromBody] AcceptAppointmentDto dto)
    {
        var mentorId = User.GetUserId();
        var result = await _bookingService.AcceptAppointment(mentorId, appointmentId, dto);
        return Ok(result);
    }

    [HttpPost("appointments/{appointmentId}/cancel")]
    [Authorize]
    public async Task<ActionResult<Message>> CancelAppointment(Guid appointmentId)
    {
        var userId = User.GetUserId();
        var result = await _bookingService.CancelAppointment(userId, appointmentId);
        return Ok(result);
    }

    [HttpPost("appointments/{appointmentId}/complete")]
    [Authorize(Roles = Roles.Mentor)]
    public async Task<ActionResult<Message>> CompleteAppointment(Guid appointmentId)
    {
        var mentorId = User.GetUserId();
        var result = await _bookingService.CompleteAppointment(mentorId, appointmentId);
        return Ok(result);
    }

    [HttpDelete("appointments/{appointmentId}")]
    [Authorize(Roles = Roles.User)]
    public async Task<ActionResult<Message>> DeleteAppointment(Guid appointmentId)
    {
        var menteeId = User.GetUserId();
        var result = await _bookingService.DeleteAppointment(menteeId, appointmentId);
        return Ok(result);
    }
}
