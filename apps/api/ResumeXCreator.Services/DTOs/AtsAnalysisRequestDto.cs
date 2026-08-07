using System;

namespace ResumeXCreator.Services.DTOs;

public record AtsAnalysisRequestDto
{
  public string ExternalJobLink { get; init; } = default!;
  public Guid ProfileId { get; init; }
  public string? JobDescriptionText { get; init; }
  public string LanguageCode { get; init; } = "en";
}
