using System;
using System.Collections.Generic;
using ResumeXCreator.Domain.Enums;

namespace ResumeXCreator.Services.DTOs;

public record CreateProfileDto
{
  public string? UserId { get; init; }
  public string ProfileName { get; init; } = string.Empty;
  public string FullName { get; init; } = string.Empty;
  public string Title { get; init; } = string.Empty;
  public string Summary { get; init; } = string.Empty;
  public string Email { get; init; } = string.Empty;
  public string Phone { get; init; } = string.Empty;
  public string ExperienceJson { get; init; } = "[]";
  public string EducationJson { get; init; } = "[]";
  public List<string> Skills { get; init; } = [];
  public List<string> SocialLinks { get; init; } = [];
  public string? PhotoUrl { get; init; }
  public bool ShowPhoto { get; init; }
  public string Location { get; init; } = string.Empty;
  public List<string> Languages { get; init; } = [];
  public MilitaryStatus? MilitaryStatus { get; init; }
  public DateTime? MilitaryPostponedUntil { get; init; }

  public List<ProjectDto>? Projects { get; init; }
  public List<EducationDto>? Educations { get; init; }
  public List<ExperienceDto>? Experiences { get; init; }
}
