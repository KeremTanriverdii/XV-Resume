using System;

namespace ResumeXCreator.Domain.Entities;

public class ProfileProject
{
  public Guid ProfileId { get; set; }
  public Profile? Profile { get; set; }

  public Guid ProjectId { get; set; }
  public Project? Project { get; set; }

  public int SortOrder { get; set; }
}
