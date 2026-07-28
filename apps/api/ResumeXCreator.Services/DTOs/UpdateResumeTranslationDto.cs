namespace ResumeXCreator.Services.DTOs;

public record UpdateResumeTranslationDto
{
  public string? Title { get; init; }
  public string? Summary { get; init; }
  public string? ExperienceHtml { get; init; }
  public string? EducationHtml { get; init; }
  public string? SkillsHtml { get; init; }
  public string? LanguagesHtml { get; init; }
  public string? ProjectsHtml { get; init; }
}
