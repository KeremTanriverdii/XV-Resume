using System;
using System.Collections.Generic;

namespace ResumeXCreator.Services.DTOs;

public class CreateAtsScanDto
{
  public string ExternalJobLink { get; set; } = string.Empty;
  public string ProfileId { get; set; } = string.Empty;
  public string? JobDescriptionText { get; set; }
}

public class AtsScanDto
{
  public Guid Id { get; set; }
  public string UserId { get; set; } = default!;
  public Guid? ProfileId { get; set; }
  public string JobTitle { get; set; } = default!;
  public string ExternalJobLink { get; set; } = string.Empty;
  public string JobDescription { get; set; } = string.Empty;
  public int MatchPercentage { get; set; }
  public List<string> MatchedSkills { get; set; } = [];
  public List<string> MissingSkills { get; set; } = [];
  public List<string> CriticalMissingSkills { get; set; } = [];
  public List<string> RecommendedMissingSkills { get; set; } = [];
  public string AtsFeedback { get; set; } = string.Empty;
  public DateTime CreatedAt { get; set; }
  public ProfileDto? Profile { get; set; }
}
