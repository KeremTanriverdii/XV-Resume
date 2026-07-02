namespace ResumeXCreator.Services.DTOs;

public record CreateEducationDto
{
  public string SchoolName { get; init; } = string.Empty;
  public string Degree { get; init; } = string.Empty;
  public string FieldOfStudy { get; init; } = string.Empty;
  public DateTime StartDate { get; init; }
  public DateTime EndDate { get; init; }
  public string? GPA { get; init; } = string.Empty;

}