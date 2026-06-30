using System;
using System.Collections.Generic;

namespace ResumeXCreator.Services.DTOs;

/// <summary>
/// One-time profile data for CV generation without creating a profile.
/// Scenario C: User enters manual information without creating a profile.
/// </summary>
public class ManualProfileDataDto
{
  public string FullName { get; set; } = string.Empty;
  public string Title { get; set; } = string.Empty;
  public string Summary { get; set; } = string.Empty;
  public string Email { get; set; } = string.Empty;
  public string Phone { get; set; } = string.Empty;
  public List<string> Skills { get; set; } = [];
  public List<ExperienceDto>? Experiences { get; set; }
  public List<EducationDto>? Educations { get; set; }
  public List<ProjectDto>? Projects { get; set; }
}
