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

// Services
builder.Services.AddScoped<IResumeService, ResumeService>();

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

// API Endpoints
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
