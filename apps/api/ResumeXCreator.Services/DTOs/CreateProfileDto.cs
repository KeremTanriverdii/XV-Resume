using System.Collections.Generic;

namespace ResumeXCreator.Services.DTOs;

public class CreateProfileDto
{
  public string? UserId { get; set; }
  public string ProfileName { get; set; } = string.Empty;
  public string FullName { get; set; } = string.Empty;
  public string Title { get; set; } = string.Empty;
  public string Summary { get; set; } = string.Empty;
  public string Email { get; set; } = string.Empty;
  public string Phone { get; set; } = string.Empty;
  public string ExperienceJson { get; set; } = "[]";
  public string EducationJson { get; set; } = "[]";
  public List<string> Skills { get; set; } = [];
  public List<string> SocialLinks { get; set; } = [];
  public string? PhotoUrl { get; set; }
  public bool ShowPhoto { get; set; }

  public List<ProjectDto>? Projects { get; set; }
  public List<EducationDto>? Educations { get; set; }
  public List<ExperienceDto>? Experiences { get; set; }
}
