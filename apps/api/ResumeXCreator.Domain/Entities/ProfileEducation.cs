using System;

namespace ResumeXCreator.Domain.Entities;

public class ProfileEducation
{
  public Guid ProfileId { get; set; }
  public Profile? Profile { get; set; }

  public Guid EducationId { get; set; }
  public Education? Education { get; set; }

  public int SortOrder { get; set; }
}
