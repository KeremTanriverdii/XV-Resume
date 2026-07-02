using System;

namespace ResumeXCreator.Services.DTOs;

public record EducationDto
{
  public Guid Id { get; init; }
  public Guid? ProfileId { get; init; }
  public string SchoolName { get; init; } = string.Empty;
  public string Degree { get; init; } = string.Empty;
  public string FieldOfStudy { get; init; } = string.Empty;
  public DateTime StartDate { get; init; }
  public DateTime? EndDate { get; init; }
  public bool IsOngoing { get; init; }
  public string? GPA { get; init; } = string.Empty;
}
