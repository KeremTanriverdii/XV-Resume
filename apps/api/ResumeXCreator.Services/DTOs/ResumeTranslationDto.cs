using System;

namespace ResumeXCreator.Services.DTOs;

public class ResumeTranslationDto
{
  public int Id { get; set; }
  public Guid ResumeId { get; set; }
  public string LanguageCode { get; set; } = string.Empty;
  public string Title { get; set; } = string.Empty;
  public string Summary { get; set; } = string.Empty;
  public string ExperienceHtml { get; set; } = string.Empty;
  public string EducationHtml { get; set; } = string.Empty;
  public string SkillsHtml { get; set; } = string.Empty;
  public int Version { get; set; }
  public DateTime CreatedAt { get; set; }
}
