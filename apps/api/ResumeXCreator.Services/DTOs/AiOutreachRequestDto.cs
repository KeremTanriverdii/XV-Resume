using System;

namespace ResumeXCreator.Services.DTOs;

public class AiOutreachRequestDto
{
  public string OutreachType { get; set; } = "CoverLetter"; // "CoverLetter" | "ColdMessage"
  public string SourceType { get; set; } = "Profile"; // "Upload" | "Resume" | "Profile"
  public Guid? SourceId { get; set; }
  public string? UploadedCvText { get; set; }
  public string? JobUrl { get; set; }
  public string? JobDescription { get; set; }
  public string LanguageCode { get; set; } = "en";
}
