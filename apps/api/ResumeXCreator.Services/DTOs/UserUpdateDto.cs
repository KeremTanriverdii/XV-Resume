namespace ResumeXCreator.Services.DTOs;

public record UserUpdateDto
{
  public string ChoosedLanguage { get; init; } = string.Empty;
  public string Fullname { get; init; } = string.Empty;
  public string Phone { get; init; } = string.Empty;
  public string DistrictAndCityLocation { get; init; } = string.Empty;
  public string? PostponedTitle { get; init; } = string.Empty;
}