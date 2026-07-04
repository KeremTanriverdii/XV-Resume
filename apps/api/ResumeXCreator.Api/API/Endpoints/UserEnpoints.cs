
using System.Security.Claims;
using System.Text.RegularExpressions;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Api.API.Endpoints;

public static class UserEnpoints
{
  public static void MapUserEndpoints(this IEndpointRouteBuilder app)
  {
    var group = app.MapGroup("api/v1/user").RequireAuthorization();

    group.MapGet("/", async (HttpContext ctx, IUserService userService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();
      var user = await userService.GetUserAsync(userId);
      return user is not null ? Results.Ok(user) : Results.NotFound();
    })
    .WithName("GetUser");

    group.MapPut("/", async (HttpContext ctx, UserUpdateDto dto, IUserService userService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();
      var user = await userService.UpdateUserAsync(dto, userId);
      return Results.Ok(user);
    }).WithName("UpdateUser");

  }
}