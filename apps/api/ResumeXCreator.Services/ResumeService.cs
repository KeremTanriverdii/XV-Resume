using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services;

public class ResumeService(IResumeRepository resumeRepository, IProfileRepository profileRepository) : IResumeService
{
  private readonly IResumeRepository _resumeRepository = resumeRepository;
  private readonly IProfileRepository _profileRepository = profileRepository;

  public async Task<IEnumerable<ResumeDto>> GetAllResumesAsync()
  {
    var resumes = await _resumeRepository.GetAllAsync();
    return resumes.Select(MapToDto);
  }

  public async Task<ResumeDto?> GetResumeByIdAsync(Guid id)
  {
    var resume = await _resumeRepository.GetWithTranslationsByIdAsync(id);
    if (resume == null) return null;
    return MapToDto(resume);
  }

  public async Task<ResumeDto> CreateResumeAsync(CreateResumeDto createResumeDto)
  {
    // Profil bilgilerini çek (CV üretimi için)
    Profile? profile = null;
    if (createResumeDto.ProfileId.HasValue)
    {
      profile = await _profileRepository.GetByIdAsync(createResumeDto.ProfileId.Value);
    }

    var resume = new Resume
    {
      Id = Guid.NewGuid(),
      ProfileId = createResumeDto.ProfileId,
      JobDescription = createResumeDto.JobDescription,
      CreatedAt = DateTime.UtcNow
    };

    var targetLanguages = createResumeDto.SelectedLanguagesForGeneration?.Count > 0
        ? createResumeDto.SelectedLanguagesForGeneration
        : ["en"];

    var profileTitle = profile?.Title ?? "Untitled";

    foreach (var lang in targetLanguages)
    {
      // TODO(AI-Integration): Burada ileride AI servisi çağrılarak
      // profilin deneyim/eğitim/yetenek verilerine göre
      // iş ilanına özel CV içeriği üretilecek.
      resume.Translations.Add(new ResumeTranslation
      {
        ResumeId = resume.Id,
        LanguageCode = lang,
        Title = $"{profileTitle} ({lang.ToUpper()})",
        Summary = $"Generated summary in {lang} for {profileTitle}",
        ExperienceHtml = $"<p>Generated experience HTML in {lang}</p>",
        EducationHtml = $"<p>Generated education HTML in {lang}</p>",
        SkillsHtml = $"<p>Generated skills HTML in {lang}</p>"
      });
    }

    await _resumeRepository.AddAsync(resume);
    await _resumeRepository.SaveChangesAsync();

    return MapToDto(resume);
  }

  private static ResumeDto MapToDto(Resume r) => new()
  {
    Id = r.Id,
    ProfileId = r.ProfileId,
    JobDescription = r.JobDescription,
    CreatedAt = r.CreatedAt,
    Translations = [.. r.Translations.Select(t => new ResumeTranslationDto
    {
      Id = t.Id,
      ResumeId = t.ResumeId,
      LanguageCode = t.LanguageCode,
      Title = t.Title,
      Summary = t.Summary,
      ExperienceHtml = t.ExperienceHtml,
      EducationHtml = t.EducationHtml,
      SkillsHtml = t.SkillsHtml
    })]
  };
}
