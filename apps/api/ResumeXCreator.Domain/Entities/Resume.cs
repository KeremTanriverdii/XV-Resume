using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace ResumeXCreator.Domain.Entities;

public class Resume
{
  public Guid Id { get; set; }
  public Guid? ProfileId { get; set; }
  public string JobDescription { get; set; } = string.Empty;
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  // Navigation Properties
  public Profile? Profile { get; set; }
  public ICollection<ResumeTranslation> Translations { get; set; } = [];

  [NotMapped]
  public List<string> SelectedLanguagesForGeneration { get; set; } = [];
}
