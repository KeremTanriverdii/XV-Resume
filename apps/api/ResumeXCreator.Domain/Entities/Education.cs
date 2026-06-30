namespace ResumeXCreator.Domain.Entities;

public class Education
{
  public Guid Id { get; set; } = Guid.NewGuid();
  public Guid ProfileId { get; set; }
  public string SchoolName { get; set; } = string.Empty;
  public string Degree { get; set; } = string.Empty;
  public string FieldOfStudy { get; set; } = string.Empty;
  public string StartDate { get; set; } = string.Empty;
  public string EndDate { get; set; } = string.Empty;
  public string? GPA { get; set; } = string.Empty;

  // Navigation property
  public Profile? Profile { get; set; }
}
