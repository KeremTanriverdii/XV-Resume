using System.Security.Claims;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Api.API.Endpoints;

public static class ProfileEndpoints
{
  public static void MapProfileEndpoints(this IEndpointRouteBuilder app)
  {
    var group = app.MapGroup("/api/v1/profiles");

    // GET /api/v1/profiles?userId=xxx
    group.MapGet("/", async (string userId, IProfileService profileService) =>
    {
      var profiles = await profileService.GetProfilesByUserIdAsync(userId);
      return Results.Ok(profiles);
    })
    .WithName("GetProfilesByUserId");

    // GET /api/v1/profiles/{id}
    group.MapGet("/{id:guid}", async (Guid id, IProfileService profileService) =>
    {
      var profile = await profileService.GetProfileByIdAsync(id);
      return profile is not null ? Results.Ok(profile) : Results.NotFound();
    })
    .WithName("GetProfileById");

    // POST /api/v1/profiles
    group.MapPost("/", async (CreateProfileDto dto, IProfileService profileService) =>
    {
      var result = await profileService.CreateProfileAsync(dto);
      return Results.Created($"/api/v1/profiles/{result.Id}", result);
    })
    .WithName("CreateProfile");

    // PUT /api/v1/profiles/{id}
    group.MapPut("/{id:guid}", async (Guid id, CreateProfileDto dto, IProfileService profileService) =>
    {
      var result = await profileService.UpdateProfileAsync(id, dto);
      return result is not null ? Results.Ok(result) : Results.NotFound();
    })
    .WithName("UpdateProfile");

    // DELETE /api/v1/profiles/{id}
    group.MapDelete("/{id:guid}", async (Guid id, IProfileService profileService) =>
    {
      var deleted = await profileService.DeleteProfileAsync(id);
      return deleted ? Results.NoContent() : Results.NotFound();
    })
    .WithName("DeleteProfile");
  }
}
