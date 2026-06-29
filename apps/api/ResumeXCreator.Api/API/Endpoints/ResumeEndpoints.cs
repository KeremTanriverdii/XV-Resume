using System.Security.Claims;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Api.API.Endpoints;

public static class ResumeEndpoints
{
  public static void MapResumeEndpoints(this IEndpointRouteBuilder app)
  {
    var group = app.MapGroup("/api/v1/resumes");

    // GET /api/v1/resumes
    group.MapGet("/", async (IResumeService resumeService) =>
    {
      var resumes = await resumeService.GetAllResumesAsync();
      return Results.Ok(resumes);
    })
    .WithName("GetAllResumes")
    .RequireAuthorization();

    // GET /api/v1/resumes/{id}
    group.MapGet("/{id:guid}", async (Guid id, IResumeService resumeService) =>
    {
      var resume = await resumeService.GetResumeByIdAsync(id);
      return resume is not null ? Results.Ok(resume) : Results.NotFound();
    })
    .WithName("GetResumeById")
    .RequireAuthorization();

    // POST /api/v1/resumes/generate
    group.MapPost("/generate", async (CreateResumeDto dto, IResumeService resumeService, HttpContext ctx) =>
    {
      // JWT token'ından kullanıcı kimliğini çek
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? ctx.User.FindFirstValue("sub");

      if (string.IsNullOrEmpty(userId))
        return Results.Unauthorized();

      try
      {
        var result = await resumeService.GenerateResumeAsync(dto, userId);
        return Results.Created($"/api/v1/resumes/{result.Id}", result);
      }
      catch (ArgumentException ex)
      {
        return Results.BadRequest(new { error = ex.Message });
      }
      catch (UnauthorizedAccessException ex)
      {
        return Results.Json(new { error = ex.Message }, statusCode: 403);
      }
    })
    .WithName("GenerateResume")
    .RequireAuthorization();
  }
}
