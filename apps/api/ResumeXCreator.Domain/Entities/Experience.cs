using System;
using System.Collections.Generic;

namespace ResumeXCreator.Domain.Entities;

public class Experience
{
  public Guid Id { get; set; } = Guid.NewGuid();
  public string? UserId { get; set; }
  public string CompanyName { get; set; } = string.Empty;
  public string Role { get; set; } = string.Empty;
  public DateTime StartDate { get; set; } = DateTime.Today;
  public DateTime? EndDate { get; set; }
  public bool IsOngoing { get; set; }
  public string Description { get; set; } = string.Empty;
  public string? LogoUrl { get; set; } = string.Empty;
  public string? Location { get; set; } = string.Empty;

  // Navigation properties
  public User? User { get; set; }
  public ICollection<ProfileExperience> ProfileExperiences { get; set; } = [];
}
