using System;

namespace ResumeXCreator.Services.DTOs;

public class ProjectDto
{
  public Guid Id { get; set; }
  public Guid ProfileId { get; set; }
  public string Title { get; set; } = string.Empty;
  public string Description { get; set; } = string.Empty;
  public string? TechologiesUsed { get; set; } = string.Empty;
  public string? Links { get; set; } = string.Empty;
  public string? RepositoryUrl { get; set; } = string.Empty;
}
