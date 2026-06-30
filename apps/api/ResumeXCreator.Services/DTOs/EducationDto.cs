using System;

namespace ResumeXCreator.Services.DTOs;

public class EducationDto
{
  public Guid Id { get; set; }
  public Guid ProfileId { get; set; }
  public string SchoolName { get; set; } = string.Empty;
  public string Degree { get; set; } = string.Empty;
  public string FieldOfStudy { get; set; } = string.Empty;
  public string StartDate { get; set; } = string.Empty;
  public string EndDate { get; set; } = string.Empty;
  public string? GPA { get; set; } = string.Empty;
}
