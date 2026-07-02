namespace ResumeXCreator.Services.DTOs;

public record CreateExperienceDto
{
  public Guid? ProfileId { get; init; }
  public string CompanyName { get; init; } = string.Empty;
  public string Role { get; init; } = string.Empty;
  public DateTime StartDate { get; init; }
  public DateTime EndDate { get; init; }
  public string Description { get; init; } = string.Empty;
  public string? LogoUrl { get; init; } = string.Empty;
  public string? Location { get; init; } = string.Empty;
}