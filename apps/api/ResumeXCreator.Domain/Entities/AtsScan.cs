using System;

namespace ResumeXCreator.Domain.Entities;

public class AtsScan
{
  public Guid Id { get; set; }
  public string UserId { get; set; } = default!;
  public Guid? ProfileId { get; set; }
  public string JobTitle { get; set; } = default!;
  public string ExternalJobLink { get; set; } = string.Empty;
  public string JobDescription { get; set; } = string.Empty;
  public int MatchPercentage { get; set; }
  public string? MatchedSkillsJson { get; set; }
  public string? MissingSkillsJson { get; set; }
  public string? CriticalMissingSkillsJson { get; set; }
  public string? RecommendedMissingSkillsJson { get; set; }
  public string AtsFeedback { get; set; } = string.Empty;
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  public Profile? Profile { get; set; }
}
