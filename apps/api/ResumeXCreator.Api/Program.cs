using Microsoft.EntityFrameworkCore;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Infrastructure.Data;
using ResumeXCreator.Infrastructure.Repositories;
using ResumeXCreator.Services;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repositories
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IResumeRepository, ResumeRepository>();
builder.Services.AddScoped<IProfileRepository, ProfileRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Services
builder.Services.AddScoped<IResumeService, ResumeService>();
builder.Services.AddScoped<IProfileService, ProfileService>();

// CORS
builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowFrontend", policy =>
  {
    policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
  });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
  app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// ── Profile Endpoints ──

app.MapGet("/api/profiles", async (string userId, IProfileService profileService) =>
{
  var profiles = await profileService.GetProfilesByUserIdAsync(userId);
  return Results.Ok(profiles);
})
.WithName("GetProfilesByUserId");

app.MapGet("/api/profiles/{id:guid}", async (Guid id, IProfileService profileService) =>
{
  var profile = await profileService.GetProfileByIdAsync(id);
  return profile is not null ? Results.Ok(profile) : Results.NotFound();
})
.WithName("GetProfileById");

app.MapPost("/api/profiles", async (CreateProfileDto dto, IProfileService profileService) =>
{
  var result = await profileService.CreateProfileAsync(dto);
  return Results.Created($"/api/profiles/{result.Id}", result);
})
.WithName("CreateProfile");

app.MapPut("/api/profiles/{id:guid}", async (Guid id, CreateProfileDto dto, IProfileService profileService) =>
{
  var result = await profileService.UpdateProfileAsync(id, dto);
  return result is not null ? Results.Ok(result) : Results.NotFound();
})
.WithName("UpdateProfile");

app.MapDelete("/api/profiles/{id:guid}", async (Guid id, IProfileService profileService) =>
{
  var deleted = await profileService.DeleteProfileAsync(id);
  return deleted ? Results.NoContent() : Results.NotFound();
})
.WithName("DeleteProfile");

// ── Resume Endpoints ──

app.MapGet("/api/resumes", async (IResumeService resumeService) =>
{
  var resumes = await resumeService.GetAllResumesAsync();
  return Results.Ok(resumes);
})
.WithName("GetAllResumes");

app.MapGet("/api/resumes/{id:guid}", async (Guid id, IResumeService resumeService) =>
{
  var resume = await resumeService.GetResumeByIdAsync(id);
  return resume is not null ? Results.Ok(resume) : Results.NotFound();
})
.WithName("GetResumeById");

app.MapPost("/api/resumes", async (CreateResumeDto createDto, IResumeService resumeService) =>
{
  var result = await resumeService.CreateResumeAsync(createDto);
  return Results.Created($"/api/resumes/{result.Id}", result);
})
.WithName("CreateResume");

app.Run();
