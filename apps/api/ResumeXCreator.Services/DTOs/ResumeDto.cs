using System;
using System.Collections.Generic;

namespace ResumeXCreator.Services.DTOs;

public class ResumeDto
{
  public Guid Id { get; set; }
  public Guid? ProfileId { get; set; }
  public string JobDescription { get; set; } = string.Empty;
  public DateTime CreatedAt { get; set; }
  public List<ResumeTranslationDto> Translations { get; set; } = [];
}
