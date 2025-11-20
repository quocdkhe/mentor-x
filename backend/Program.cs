using backend.Extensions;
using backend.Models;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddProjectServices(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer(); // Required for Swagger
builder.Services.AddSwaggerGen();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();       // Serve Swagger JSON
    app.UseSwaggerUI(c =>   // Serve Swagger UI
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MentorX API V1");
        c.RoutePrefix = string.Empty; // Optional: serve UI at root /
    });
}

app.UseHttpsRedirection();
app.UseCors("CorsPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
