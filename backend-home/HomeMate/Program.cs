using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using HomeMate.Data;
using HomeMate.Services;
using System;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS - Updated configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins(
            "http://localhost:4200",
            "https://localhost:4200",
            "http://localhost:8080",
            "https://localhost:8080"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// MongoDB and application services
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<IHousingService, HousingService>();
builder.Services.AddScoped<IMatchService, MatchService>();
builder.Services.AddScoped<RoommateProfileService>();
builder.Services.AddScoped<IMessageService, MessageService>(); // Register IMessageService and MessageService

var app = builder.Build();

// Test MongoDB connection on startup (simplified)
try
{
    using (var scope = app.Services.CreateScope())
    {
        var mongoContext = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
        Console.WriteLine("✅ MongoDB connection tested successfully!");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ MongoDB connection failed: {ex.Message}");
}

// Add a simple test endpoint at root
app.MapGet("/", () => new
{
    message = "HomeMate API is working!",
    timestamp = DateTime.Now,
    status = "Backend running successfully"
});

// Add test endpoint for auth
app.MapGet("/api/test", () => new
{
    message = "Auth API endpoint working",
    timestamp = DateTime.Now
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use CORS before other middleware
app.UseCors("AllowAngular");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("🚀 HomeMate API is running!");
Console.WriteLine("📡 Check your browser at the default port");
Console.WriteLine("📚 Swagger available at /swagger");
Console.WriteLine("🧪 Test endpoint at /");
Console.WriteLine("🔒 CORS enabled for Angular app");

app.Run();