using System.Security.Claims;
using ResumeXCreator.Api.API.Filters;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Api.API.Endpoints;

public static class EducationEndpoints
{
  public static void MapEducationEndpoints(this IEndpointRouteBuilder app)
  {
    var group = app.MapGroup("/api/v1/education").RequireAuthorization();

    // GET /api/v1/profiles?userId=xxx
    group.MapGet("/", async (HttpContext ctx, IEducationService educationService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var educations = await educationService.GetEducationsByUserIdAsync(userId);
      return Results.Ok(educations);
    })
    .WithName("GetEducationByUserId");

    // GET /api/v1/education/{id}
    group.MapGet("/{id:guid}", async (Guid id, HttpContext ctx, IEducationService educationService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var education = await educationService.GetEducationByIdAsync(userId, id);
      return education is not null ? Results.Ok(education) : Results.NotFound();
    })
    .WithName("GetEducationById");

    // POST /api/v1/education
    group.MapPost("/", async (HttpContext ctx, CreateEducationDto dto, IEducationService educationService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var result = await educationService.CreateEducationAsync(userId, dto);
      return Results.Created($"/api/v1/education/{result.Id}", result);
    })
    .WithValidation<CreateEducationDto>()
    .WithName("CreateEducation");

    // PUT /api/v1/education/{id}
    group.MapPut("/{id:guid}", async (Guid id, HttpContext ctx, CreateEducationDto dto, IEducationService educationService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var result = await educationService.UpdateEducationAsync(userId, id, dto);
      return result is not null ? Results.Ok(result) : Results.NotFound();
    })
    .WithValidation<CreateEducationDto>()
    .WithName("UpdateEducation");

    // DELETE /api/v1/education/{id}
    group.MapDelete("/{id:guid}", async (Guid id, HttpContext ctx, IEducationService educationService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var deleted = await educationService.DeleteEducationAsync(userId, id);
      return deleted ? Results.NoContent() : Results.NotFound();
    })
    .WithName("DeleteEducation");
  }
}
