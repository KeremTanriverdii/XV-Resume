using System;

namespace ResumeXCreator.Services.DTOs;

public class ExperienceDto
{
  public Guid Id { get; set; }
  public Guid ProfileId { get; set; }
  public string CompanyName { get; set; } = string.Empty;
  public string Role { get; set; } = string.Empty;
  public string StartDate { get; set; } = string.Empty;
  public string EndDate { get; set; } = string.Empty;
  public string Description { get; set; } = string.Empty;
  public string? LogoUrl { get; set; } = string.Empty;
  public string? Location { get; set; } = string.Empty;
}
