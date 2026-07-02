using System;
using System.Collections.Generic;

namespace ResumeXCreator.Domain.Entities;

public class Education
{
  public Guid Id { get; set; } = Guid.NewGuid();
  public string? UserId { get; set; }
  public string SchoolName { get; set; } = string.Empty;
  public string Degree { get; set; } = string.Empty;
  public string FieldOfStudy { get; set; } = string.Empty;
  public DateTime StartDate { get; set; }
  public DateTime? EndDate { get; set; }
  public bool IsOngoing { get; set; }
  public string? GPA { get; set; } = string.Empty;

  // Navigation properties
  public User? User { get; set; }
  public ICollection<ProfileEducation> ProfileEducations { get; set; } = [];
}
