using System;
using System.Collections.Generic;

namespace ResumeXCreator.Services.DTOs;

public record ResumeDto
{
  public Guid Id { get; init; }
  public Guid? ProfileId { get; init; }
  public string ExternalJobLink { get; init; } = string.Empty;
  public string JobDescription { get; init; } = string.Empty;
  public DateTime CreatedAt { get; init; }
  public List<ResumeTranslationDto> Translations { get; init; } = [];
}
