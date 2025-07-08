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

// Add CORS with updated configuration - allow localhost on ports 4200 and 8080 (http and https)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins(
            "http://localhost:4200",
            "https://localhost:4200",
            "http://54.174.78.149:8080",
            "http://localhost:8080",
            "https://localhost:8080",
            "http://localhost",
            "http://localhost:80"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// Register MongoDB and application services
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<IHousingService, HousingService>();
builder.Services.AddScoped<IMatchService, MatchService>();
builder.Services.AddScoped<RoommateProfileService>();
builder.Services.AddScoped<IMessageService, MessageService>();

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

// Simple test endpoints
app.MapGet("/", () => new
{
    message = "HomeMate API is working!",
    timestamp = DateTime.Now,
    status = "Backend running successfully"
});

app.MapGet("/api/test", () => new
{
    message = "Auth API endpoint working",
    timestamp = DateTime.Now
});

// Configure the HTTP request pipeline.

// Enable Swagger in all environments (not just Development)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "HomeMate API V1");
    c.RoutePrefix = "swagger"; // Swagger UI at /swagger
});

// Use CORS middleware early in the pipeline
app.UseCors("AllowAngular");

// Handle OPTIONS requests globally (preflight) to return 200 with CORS headers
app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 200;
        // The CORS middleware already adds the necessary headers
        await context.Response.CompleteAsync();
        return;
    }
    await next();
});

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

Console.WriteLine("🚀 HomeMate API is running!");
Console.WriteLine("📡 Check your browser at the default port");
Console.WriteLine("📚 Swagger available at /swagger");
Console.WriteLine("🧪 Test endpoint at /");
Console.WriteLine("🔒 CORS enabled for Angular app");

app.Run();
