using System;

namespace ResumeXCreator.Services.DTOs;

public record ResumeTranslationDto
{
  public int Id { get; init; }
  public Guid ResumeId { get; init; }
  public string LanguageCode { get; init; } = string.Empty;
  public string Title { get; init; } = string.Empty;
  public string Summary { get; init; } = string.Empty;
  public string ExperienceHtml { get; init; } = string.Empty;
  public string EducationHtml { get; init; } = string.Empty;
  public string SkillsHtml { get; init; } = string.Empty;
  public string LanguagesHtml { get; init; } = string.Empty;
  public string? ProjectsHtml { get; init; } = string.Empty;
  public int? MatchPercentage { get; init; }
  public string? AtsFeedback { get; init; }
  public int Version { get; init; }
  public DateTime CreatedAt { get; init; }
}
