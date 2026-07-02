using System;

namespace ResumeXCreator.Services.DTOs;

public record ProjectDto
{
  public Guid Id { get; init; }
  public Guid? ProfileId { get; init; }
  public string Title { get; init; } = string.Empty;
  public string Description { get; init; } = string.Empty;
  public string? TechologiesUsed { get; init; } = string.Empty;
  public string? Links { get; init; } = string.Empty;
  public string? RepositoryUrl { get; init; } = string.Empty;
}
