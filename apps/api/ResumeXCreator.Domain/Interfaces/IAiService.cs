using System.Collections.Generic;
using System.Threading.Tasks;

namespace ResumeXCreator.Domain.Interfaces;

public interface IAiService
{
  Task<AiGeneratedResumeResult> GenerateResumeTranslationAsync(
      string externalJobLink,
      AiProfileInput profile,
      string languageCode);
}

public record AiGeneratedResumeResult
{
  public string Title { get; init; } = string.Empty;
  public string Summary { get; init; } = string.Empty;
  public string ExperienceHtml { get; init; } = string.Empty;
  public string EducationHtml { get; init; } = string.Empty;
  public string SkillsHtml { get; init; } = string.Empty;
  public string LanguagesHtml { get; init; } = string.Empty;
  public string? ProjectsHtml { get; init; } = string.Empty;
  public int MatchPercentage { get; init; }
  public string AtsFeedback { get; init; } = string.Empty;
  public string ScrapedJobDescription { get; init; } = string.Empty;
}

public record AiProfileInput
{
  public string FullName { get; init; } = string.Empty;
  public string Title { get; init; } = string.Empty;
  public string Summary { get; init; } = string.Empty;
  public string Email { get; init; } = string.Empty;
  public string Phone { get; init; } = string.Empty;
  public string Location { get; init; } = string.Empty;
  public string? MilitaryStatus { get; init; } = string.Empty;
  public string? PostponedUntil { get; init; } = string.Empty;
  public string? PhotoUrl { get; init; } = string.Empty;
  public string SocialLinks { get; init; } = string.Empty;
  public List<string> Languages { get; init; } = [];
  public List<string> Skills { get; init; } = [];
  public List<AiExperienceInput> Experiences { get; init; } = [];
  public List<AiEducationInput> Educations { get; init; } = [];
  public List<AiProjectInput> Projects { get; init; } = [];
}

public record AiExperienceInput
{
  public string CompanyName { get; init; } = string.Empty;
  public string Role { get; init; } = string.Empty;
  public string StartDate { get; init; } = string.Empty;
  public string EndDate { get; init; } = string.Empty;
  public string Description { get; init; } = string.Empty;
}

public record AiEducationInput
{
  public string SchoolName { get; init; } = string.Empty;
  public string Degree { get; init; } = string.Empty;
  public string FieldOfStudy { get; init; } = string.Empty;
  public string StartDate { get; init; } = string.Empty;
  public string EndDate { get; init; } = string.Empty;
  public string GPA { get; init; } = string.Empty;
}

public record AiProjectInput
{
  public string Title { get; init; } = string.Empty;
  public string Description { get; init; } = string.Empty;
  public List<string> TechologiesUsed { get; init; } = [];
  public string? Links { get; init; }
  public string? RepositoryUrl { get; init; }
}
