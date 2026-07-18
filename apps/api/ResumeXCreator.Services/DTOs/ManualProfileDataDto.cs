using System;
using System.Collections.Generic;

namespace ResumeXCreator.Services.DTOs;

/// <summary>
/// One-time profile data for CV generation without creating a profile.
/// Scenario C: User enters manual information without creating a profile.
/// </summary>
public record ManualProfileDataDto
{
  public string FullName { get; init; } = string.Empty;
  public string Title { get; init; } = string.Empty;
  public string Summary { get; init; } = string.Empty;
  public string Email { get; init; } = string.Empty;
  public string Phone { get; init; } = string.Empty;
  public string SocialLinks { get; init; } = string.Empty;
  public List<string> Skills { get; init; } = [];
  public List<ExperienceDto>? Experiences { get; init; }
  public List<EducationDto>? Educations { get; init; }
  public List<ProjectDto>? Projects { get; init; }
}
