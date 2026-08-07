using System.Security.Claims;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Api.API.Endpoints;

public static class AtsScanEndpoints
{
  public static void MapAtsScanEndpoints(this IEndpointRouteBuilder app)
  {
    var group = app.MapGroup("/api/v1/ats-scans").RequireAuthorization();

    // GET /api/v1/ats-scans
    group.MapGet("/", async (IAtsScanService scanService, HttpContext ctx, int? page, int? pageSize) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? ctx.User.FindFirstValue("sub");

      if (string.IsNullOrEmpty(userId))
        return Results.Unauthorized();

      var p = page.HasValue && page.Value > 0 ? page.Value : 1;
      var ps = pageSize.HasValue && pageSize.Value > 0 ? pageSize.Value : 10;

      var scans = await scanService.GetUserScansAsync(userId, p, ps);
      return Results.Ok(scans);
    })
    .WithName("GetAllAtsScans");

    // GET /api/v1/ats-scans/{id}
    group.MapGet("/{id:guid}", async (Guid id, IAtsScanService scanService) =>
    {
      var scan = await scanService.GetScanByIdAsync(id);
      return scan is not null ? Results.Ok(scan) : Results.NotFound();
    })
    .WithName("GetAtsScanById");

    // POST /api/v1/ats-scans
    group.MapPost("/", async (CreateAtsScanDto dto, IAtsScanService scanService, HttpContext ctx) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? ctx.User.FindFirstValue("sub");

      if (string.IsNullOrEmpty(userId))
        return Results.Unauthorized();

      try
      {
        var result = await scanService.CreateScanAsync(dto, userId);
        return Results.Created($"/api/v1/ats-scans/{result.Id}", result);
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
    .RequireRateLimiting("ai-generation")
    .WithName("CreateAtsScan");

    // DELETE /api/v1/ats-scans/{id}
    group.MapDelete("/{id:guid}", async (Guid id, IAtsScanService scanService, HttpContext ctx) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? ctx.User.FindFirstValue("sub");

      if (string.IsNullOrEmpty(userId))
        return Results.Unauthorized();

      try
      {
        var success = await scanService.DeleteScanAsync(id, userId);
        return success ? Results.NoContent() : Results.NotFound();
      }
      catch (UnauthorizedAccessException ex)
      {
        return Results.Json(new { error = ex.Message }, statusCode: 403);
      }
    })
    .WithName("DeleteAtsScan");
  }
}
