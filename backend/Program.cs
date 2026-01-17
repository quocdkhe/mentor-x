//using backend.Configurations;
using backend.Configurations;
using backend.Models;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

// Add DB context
builder.Services.AddDbContext<MentorXContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer(); // Required for Swagger
builder.Services.AddSwaggerGen(); // Swagger configuration
builder.Services.AddStorageConfig(builder.Configuration); // Storage configuration  
builder.Services.AddHttpClient(); // HttpClient for external API calls

// Add services to the container.
builder.Services.AddProjectServices();
builder.Services.AddJwtConfig(builder.Configuration); // JWT and CORS configuration


var app = builder.Build();
// Run migration
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<MentorXContext>();
    context.Database.Migrate();
}

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
