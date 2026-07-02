using System;

namespace ResumeXCreator.Domain.Entities;

public class ProfileExperience
{
  public Guid ProfileId { get; set; }
  public Profile? Profile { get; set; }

  public Guid ExperienceId { get; set; }
  public Experience? Experience { get; set; }

  public int SortOrder { get; set; }
}
