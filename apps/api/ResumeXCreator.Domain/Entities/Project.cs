using System;
using System.Collections.Generic;

namespace ResumeXCreator.Domain.Entities;

public class Project
{
  public Guid Id { get; set; } = Guid.NewGuid();
  public string? UserId { get; set; }
  public string ProjectTitle { get; set; } = string.Empty;
  public string Description { get; set; } = string.Empty;
  public string? TechologiesUsed { get; set; } = string.Empty;
  public string? Links { get; set; } = string.Empty;
  public string? RepositoryUrl { get; set; } = string.Empty;

  // Navigation properties
  public User? User { get; set; }
  public ICollection<ProfileProject> ProfileProjects { get; set; } = [];
}
