using System.Security.Claims;
using ResumeXCreator.Api.API.Filters;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Api.API.Endpoints;

public static class ProfileEndpoints
{
  public static void MapProfileEndpoints(this IEndpointRouteBuilder app)
  {
    var group = app.MapGroup("/api/v1/profiles").RequireAuthorization();

    // GET /api/v1/profiles?userId=xxx
    group.MapGet("/", async (HttpContext ctx, IProfileService profileService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var profiles = await profileService.GetProfilesByUserIdAsync(userId);
      return Results.Ok(profiles);
    })
    .WithName("GetProfilesByUserId");

    // GET /api/v1/profiles/{id}
    group.MapGet("/{id:guid}", async (Guid id, HttpContext ctx, IProfileService profileService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var profile = await profileService.GetProfileByIdAsync(userId, id);
      return profile is not null ? Results.Ok(profile) : Results.NotFound();
    })
    .WithName("GetProfileById");

    // POST /api/v1/profiles
    group.MapPost("/", async (HttpContext ctx, CreateProfileDto dto, IProfileService profileService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();
      var dtoWithUser = dto with { UserId = userId };

      var result = await profileService.CreateProfileAsync(dtoWithUser);
      return Results.Created($"/api/v1/profiles/{result.Id}", result);
    })
    .WithValidation<CreateProfileDto>()
    .WithName("CreateProfile");

    // PUT /api/v1/profiles/{id}
    group.MapPut("/{id:guid}", async (Guid id, HttpContext ctx, CreateProfileDto dto, IProfileService profileService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var result = await profileService.UpdateProfileAsync(userId, id, dto);
      return result is not null ? Results.Ok(result) : Results.NotFound();
    })
    .WithValidation<CreateProfileDto>()
    .WithName("UpdateProfile");

    // DELETE /api/v1/profiles/{id}
    group.MapDelete("/{id:guid}", async (Guid id, HttpContext ctx, IProfileService profileService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var deleted = await profileService.DeleteProfileAsync(userId, id);
      return deleted ? Results.NoContent() : Results.NotFound();
    })
    .WithName("DeleteProfile");
  }
}
