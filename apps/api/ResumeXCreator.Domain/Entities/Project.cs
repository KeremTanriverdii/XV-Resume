namespace ResumeXCreator.Domain.Entities;

public class Project
{
  public Guid Id { get; set; } = Guid.NewGuid();
  public Guid ProfileId { get; set; }
  public string ProjectTitle { get; set; } = string.Empty;
  public string Description { get; set; } = string.Empty;
  public string? TechologiesUsed { get; set; } = string.Empty;
  public string? Links { get; set; } = string.Empty;
  public string? RepositoryUrl { get; set; } = string.Empty;

  // Navigation property
  public Profile? Profile { get; set; }


}
