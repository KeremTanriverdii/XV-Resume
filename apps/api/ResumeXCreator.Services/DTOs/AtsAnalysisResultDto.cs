using System.Collections.Generic;

namespace ResumeXCreator.Services.DTOs;

public record AtsAnalysisResultDto
{
  public int MatchPercentage { get; init; }
  public List<string> MatchedSkills { get; init; } = [];
  public List<string> MissingSkills { get; init; } = [];
  public List<string> CriticalMissingSkills { get; init; } = [];
  public List<string> RecommendedMissingSkills { get; init; } = [];
  public string AtsFeedback { get; init; } = string.Empty;
  public string ScrapedJobTitle { get; init; } = string.Empty;
  public string ScrapedJobDescription { get; init; } = string.Empty;
}
