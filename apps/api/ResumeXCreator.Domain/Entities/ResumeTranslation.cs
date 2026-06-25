namespace ResumeXCreator.Domain.Entities;

public class ResumeTranslation
{
  public int Id { get; set; }
  public Guid ResumeId { get; set; }
  public string LanguageCode { get; set; } = default!;
  public string Title { get; set; } = default!;
  public string Summary { get; set; } = default!;
  public string ExperienceHtml { get; set; } = default!;
  public string EducationHtml { get; set; } = default!;
  public string SkillsHtml { get; set; } = default!;
  public Resume? Resume { get; set; }
}
