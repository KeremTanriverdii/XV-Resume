using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ResumeXCreator.Api.API.Endpoints;
using ResumeXCreator.Api.Hubs;
using ResumeXCreator.Infrastructure;

// ... (remaining imports handled cleanly)
using ResumeXCreator.Services;

var builder = WebApplication.CreateBuilder(args);

// Cloud Port configuration (e.g., Render, Railway, Heroku setting PORT env var)
var portVar = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(portVar) && int.TryParse(portVar, out var port))
{
  builder.WebHost.UseUrls($"http://+:{port}");
}

builder.Services.ConfigureHttpJsonOptions(options =>
{
  options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Add services to the container.
builder.Services.AddHealthChecks();

// SignalR Service
builder.Services.AddSignalR();

// Distributed Cache (IDistributedCache abstraction - ready for Redis in production)
builder.Services.AddDistributedMemoryCache();

// Infrastructure Services (DbContext & Repositories)
builder.Services.AddDatabaseServices(builder.Configuration);

// Business Services
builder.Services.AddBusinessServices();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(options =>
  {
    options.Authority = builder.Configuration["Authentication:ValidIssuer"];
    options.RequireHttpsMetadata = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
      ValidateIssuer = true,
      ValidIssuer = builder.Configuration["Authentication:ValidIssuer"],
      ValidateAudience = true,
      ValidAudience = builder.Configuration["Authentication:ValidAudience"],
      ValidateLifetime = true,
      ValidateIssuerSigningKey = true,
      IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Authentication:JwtSecret"]!))

    };
  });

builder.Services.AddAuthorization();

// Rate Limiting Policies
var permitLimit = builder.Configuration.GetValue<int>("RateLimiting:PermitLimit", 100);
var windowMinutes = builder.Configuration.GetValue<int>("RateLimiting:WindowInMinutes", 1);
var queueLimit = builder.Configuration.GetValue<int>("RateLimiting:QueueLimit", 10);

var aiPermitLimit = builder.Configuration.GetValue<int>("RateLimiting:AiPermitLimit", 10);
var aiWindowMinutes = builder.Configuration.GetValue<int>("RateLimiting:AiWindowInMinutes", 1);

builder.Services.AddRateLimiter(options =>
{
  options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
  options.AddPolicy("fixed-user", httpContext =>
  {
    var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                 ?? httpContext.Connection.RemoteIpAddress?.ToString()
                 ?? "unknown";

    return RateLimitPartition.GetFixedWindowLimiter(
      partitionKey: userId,
      factory: _ => new FixedWindowRateLimiterOptions
      {
        AutoReplenishment = true,
        PermitLimit = permitLimit,
        QueueLimit = queueLimit,
        Window = TimeSpan.FromMinutes(windowMinutes)
      });
  });

  options.AddPolicy("ai-generation", httpContext =>
  {
    var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                 ?? httpContext.Connection.RemoteIpAddress?.ToString()
                 ?? "unknown";

    return RateLimitPartition.GetFixedWindowLimiter(
      partitionKey: $"ai_{userId}",
      factory: _ => new FixedWindowRateLimiterOptions
      {
        AutoReplenishment = true,
        PermitLimit = aiPermitLimit,
        QueueLimit = 2,
        Window = TimeSpan.FromMinutes(aiWindowMinutes)
      });
  });

  options.AddPolicy("outreach-generation", httpContext =>
  {
    var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                 ?? httpContext.Connection.RemoteIpAddress?.ToString()
                 ?? "unknown";

    return RateLimitPartition.GetFixedWindowLimiter(
      partitionKey: $"outreach_{userId}",
      factory: _ => new FixedWindowRateLimiterOptions
      {
        AutoReplenishment = true,
        PermitLimit = 3, // Elevated permit limit for seamless testing
        QueueLimit = 0,
        Window = TimeSpan.FromMinutes(1)
      });
  });
});


// Dynamic CORS Configuration
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
  ?? new[] { "http://localhost:3000", "http://localhost:8080" };

builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowFrontend", policy =>
  {
    policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
  });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
  app.UseDeveloperExceptionPage();
}
else
{
  app.UseExceptionHandler(errorApp =>
  {
    errorApp.Run(async ctx =>
    {
      ctx.Response.StatusCode = 500;
      ctx.Response.ContentType = "application/json";
      await ctx.Response.WriteAsJsonAsync(new { error = "An unexpected error occurred." });
    });
  });
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

// Health Check Endpoint
app.MapHealthChecks("/health");

// ── Endpoints ──
app.MapProfileEndpoints();
app.MapExperienceEndpoints();
app.MapEducationEndpoints();
app.MapProjectEndpoints();
app.MapResumeEndpoints();
app.MapUserEndpoints();
app.MapPaymentEndpoints();
app.MapOutreachEndpoints();
app.MapHub<ResumeHub>("/hubs/resume");

app.Run();
