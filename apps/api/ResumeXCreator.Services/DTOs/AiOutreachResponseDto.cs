namespace ResumeXCreator.Services.DTOs;

public class AiOutreachResponseDto
{
  public string GeneratedText { get; set; } = string.Empty;
  public bool IsCached { get; set; }
  public string? ScrapedJobTitle { get; set; }
  public string? ScrapedJobDescription { get; set; }
}
