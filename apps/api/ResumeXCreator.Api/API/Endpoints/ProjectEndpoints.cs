using System.Security.Claims;
using ResumeXCreator.Api.API.Filters;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Api.API.Endpoints;

public static class ProjectEndpoints
{
  public static void MapProjectEndpoints(this IEndpointRouteBuilder app)
  {
    var group = app.MapGroup("/api/v1/projects").RequireAuthorization();

    // GET /api/v1/projects
    group.MapGet("/", async (HttpContext ctx, IProjectService projectService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var projects = await projectService.GetProjectsByUserIdAsync(userId);
      return Results.Ok(projects);
    })
    .WithName("GetProjectsByUserId");

    // GET /api/v1/projects/{id}
    group.MapGet("/{id:guid}", async (Guid id, HttpContext ctx, IProjectService projectService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var project = await projectService.GetProjectByIdAsync(userId, id);
      return project is not null ? Results.Ok(project) : Results.NotFound();
    })
    .WithName("GetProjectById");

    // POST /api/v1/projects
    group.MapPost("/", async (HttpContext ctx, CreateProjectDto dto, IProjectService projectService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var result = await projectService.CreateProjectAsync(userId, dto);
      return Results.Created($"/api/v1/projects/{result.Id}", result);
    })
    .WithValidation<CreateProjectDto>()
    .WithName("CreateProject");

    // PUT /api/v1/projects/{id}
    group.MapPut("/{id:guid}", async (Guid id, HttpContext ctx, CreateProjectDto dto, IProjectService projectService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var result = await projectService.UpdateProjectAsync(userId, id, dto);
      return result is not null ? Results.Ok(result) : Results.NotFound();
    })
    .WithValidation<CreateProjectDto>()
    .WithName("UpdateProject");

    // DELETE /api/v1/projects/{id}
    group.MapDelete("/{id:guid}", async (Guid id, HttpContext ctx, IProjectService projectService) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (userId == null) return Results.Unauthorized();

      var deleted = await projectService.DeleteProjectAsync(userId, id);
      return deleted ? Results.NoContent() : Results.NotFound();
    })
    .WithName("DeleteProject");
  }
}
