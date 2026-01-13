using backend.Models;
using backend.Models.DTOs;
using backend.Models.DTOs.Mentor;
using backend.Services.Interfaces;
using backend.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace backend.Controllers
{
    [ApiController]
    [Route("/availabilities")]
    public class AvailabilityController: ControllerBase
    {
        private readonly IBookingService _bookingService;
        public AvailabilityController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet("{mentorId}")]
        public async Task<ActionResult<List<AvailabilityResponseDTO>>> GetAvailabilities(Guid mentorId)
        {
            return await _bookingService.GetAvailabilities(mentorId);
        }
    }
}