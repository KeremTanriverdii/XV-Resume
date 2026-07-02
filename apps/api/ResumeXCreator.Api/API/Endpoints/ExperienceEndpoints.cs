using System.Security.Claims;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Api.API.Endpoints;

public static class ExperienceEndpoints
{
  public static void MapExperienceEndpoints(this IEndpointRouteBuilder app)
  {
    var group = app.MapGroup("/api/v1/experience").RequireAuthorization();

    // GET /api/v1/profiles?userId=xxx
    group.MapGet("/", async (HttpContext ctx, IExperienceService experienceService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var experiences = await experienceService.GetExperiencesByUserIdAsync(userId);
      return Results.Ok(experiences);
    })
    .WithName("GetExperienceByUserId");

    // GET /api/v1/experience/{id}
    group.MapGet("/{id:guid}", async (Guid id, HttpContext ctx, IExperienceService experienceService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var profile = await experienceService.GetExperienceByIdAsync(userId, id);
      return profile is not null ? Results.Ok(profile) : Results.NotFound();
    })
    .WithName("GetExperienceById");

    // POST /api/v1/experience
    group.MapPost("/", async (HttpContext ctx, CreateExperienceDto dto, IExperienceService experienceService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();


      var result = await experienceService.CreateExperienceAsync(userId, dto);
      return Results.Created($"/api/v1/experience/{result.Id}", result);
    })
    .WithName("CreateExperience");

    // PUT /api/v1/experience/{id}
    group.MapPut("/{id:guid}", async (Guid id, HttpContext ctx, CreateExperienceDto dto, IExperienceService experienceService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var result = await experienceService.UpdateExperienceAsync(userId, id, dto);
      return result is not null ? Results.Ok(result) : Results.NotFound();
    })
    .WithName("UpdateExperience");

    // DELETE /api/v1/experience/{id}
    group.MapDelete("/{id:guid}", async (Guid id, HttpContext ctx, IExperienceService experienceService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var deleted = await experienceService.DeleteExperienceAsync(userId, id);
      return deleted ? Results.NoContent() : Results.NotFound();
    })
    .WithName("DeleteExperience");
  }
}
