using backend.Models.DTOs;
using backend.Middleware.Exceptions;
using System.Net;
using System.Text.Json;

namespace backend.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly IWebHostEnvironment _env;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger,
            IWebHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var traceId = context.TraceIdentifier;
            HttpStatusCode statusCode;
            string message;

            switch (exception)
            {
                case BadRequestException badRequestEx:
                    statusCode = HttpStatusCode.BadRequest;
                    message = badRequestEx.Message;
                    _logger.LogWarning("BadRequest: {Message} | TraceId: {TraceId}", message, traceId);
                    break;

                case NotFoundException notFoundEx:
                    statusCode = HttpStatusCode.NotFound;
                    message = notFoundEx.Message;
                    _logger.LogWarning("NotFound: {Message} | TraceId: {TraceId}", message, traceId);
                    break;

                case UnauthorizedException unauthorizedEx:
                    statusCode = HttpStatusCode.Unauthorized;
                    message = unauthorizedEx.Message;
                    _logger.LogWarning("Unauthorized: {Message} | TraceId: {TraceId}", message, traceId);
                    break;

                case ForbiddenException forbiddenEx:
                    statusCode = HttpStatusCode.Forbidden;
                    message = forbiddenEx.Message;
                    _logger.LogWarning("Forbidden: {Message} | TraceId: {TraceId}", message, traceId);
                    break;

                case ConflictException conflictEx:
                    statusCode = HttpStatusCode.Conflict;
                    message = conflictEx.Message;
                    _logger.LogWarning("Conflict: {Message} | TraceId: {TraceId}", message, traceId);
                    break;

                default:
                    statusCode = HttpStatusCode.InternalServerError;
                    message = _env.IsDevelopment()
                        ? exception.Message
                        : "Có lỗi xảy ra, vui lòng thử lại sau";
                    _logger.LogError(exception, "Unhandled exception | TraceId: {TraceId}", traceId);
                    break;
            }

            var errorResponse = new ErrorResponse(
                (int)statusCode,
                message,
                _env.IsDevelopment() ? traceId : null
            );

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            var json = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(json);
        }
    }
}
