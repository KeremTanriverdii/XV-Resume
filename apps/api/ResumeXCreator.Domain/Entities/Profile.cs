using System;
using System.Collections.Generic;

namespace ResumeXCreator.Domain.Entities;

public class Profile
{
  public Guid Id { get; set; }
  public string? UserId { get; set; }
  public string ProfileName { get; set; } = string.Empty;
  public string FullName { get; set; } = string.Empty;
  public string Title { get; set; } = string.Empty;
  public string Summary { get; set; } = string.Empty;
  public string Email { get; set; } = string.Empty;
  public string Phone { get; set; } = string.Empty;
  public string ExperienceJson { get; set; } = "[]";
  public string EducationJson { get; set; } = "[]";
  public List<string> Skills { get; set; } = [];
  public List<string> SocialLinks { get; set; } = [];
  public string? PhotoUrl { get; set; }
  public bool ShowPhoto { get; set; }
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  // Navigation Properties
  public User? User { get; set; }
  public ICollection<Resume> Resumes { get; set; } = [];
  public ICollection<Project> Projects { get; set; } = [];
  public ICollection<Education> Educations { get; set; } = [];
  public ICollection<Experience> Experiences { get; set; } = [];
}
