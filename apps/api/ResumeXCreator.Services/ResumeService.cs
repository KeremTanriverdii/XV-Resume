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
    var resume = new Resume
    {
      Id = Guid.NewGuid(),
      ProfileId = createResumeDto.ProfileId,
      ExternalJobLink = createResumeDto.ExternalJobLink,
      JobDescription = "Pending AI processing",
      CreatedAt = DateTime.UtcNow
    };

    await _resumeRepository.AddAsync(resume);
    await _resumeRepository.SaveChangesAsync();

    return MapToDto(resume);
  }

  /// <summary>
  /// CV Generation Process:
  /// 1. Validation (ExternalJobLink required, exactly 1 profile source)
  /// 2. Profile resolution (existing / new / manual)
  /// 3. Authorization check (if ProfileId is given, is it owned?)
  /// 4. AI integration (TODO: read job description + generate CV)
  /// 5. Save Resume + ResumeTranslation and return
  /// </summary>
  public async Task<ResumeDto> GenerateResumeAsync(CreateResumeDto dto, string authenticatedUserId)
  {
    // ── 0. Version Update (Adding a new version to the existing CV session) ──
    if (dto.ResumeId.HasValue)
    {
      var existingResume = await _resumeRepository.GetWithTranslationsByIdAsync(dto.ResumeId.Value);
      if (existingResume == null)
        throw new ArgumentException($"CV session not found: {dto.ResumeId.Value}");

      // Authorization Check
      if (existingResume.ProfileId.HasValue)
      {
        var profileObj = await _profileRepository.GetByIdAsync(existingResume.ProfileId.Value);
        if (profileObj != null && profileObj.UserId != authenticatedUserId)
          throw new UnauthorizedAccessException("You do not have permission to access this profile.");
      }

      var langs = dto.SelectedLanguagesForGeneration?.Count > 0
          ? dto.SelectedLanguagesForGeneration
          : ["en"];

      var existingFullName = existingResume.Profile?.FullName ?? "User";
      var existingTitle = existingResume.Profile?.Title ?? "Resume";

      foreach (var lang in langs)
      {
        var currentMaxVersion = existingResume.Translations
            .Where(t => t.LanguageCode.Equals(lang, StringComparison.OrdinalIgnoreCase))
            .Select(t => t.Version)
            .DefaultIfEmpty(0)
            .Max();

        var nextVersion = currentMaxVersion + 1;

        // TODO(AI-Integration): Mevcut CV oturumuna bağlı olarak revizyon üretimi
        existingResume.Translations.Add(new ResumeTranslation
        {
          ResumeId = existingResume.Id,
          LanguageCode = lang,
          Version = nextVersion,
          Title = $"{existingFullName} - {existingTitle} v{nextVersion} ({lang.ToUpper()})",
          Summary = $"[AI-PLACEHOLDER] Generated summary v{nextVersion} in {lang} for {existingFullName}",
          ExperienceHtml = $"<p>[AI-PLACEHOLDER] Experience HTML v{nextVersion} in {lang}</p>",
          EducationHtml = $"<p>[AI-PLACEHOLDER] Education HTML v{nextVersion} in {lang}</p>",
          SkillsHtml = $"<p>[AI-PLACEHOLDER] Skills HTML v{nextVersion} in {lang}</p>",
          CreatedAt = DateTime.UtcNow
        });
      }

      await _resumeRepository.SaveChangesAsync();
      return MapToDto(existingResume);
    }

    // ── 1. Validasyon ──
    if (string.IsNullOrWhiteSpace(dto.ExternalJobLink))
      throw new ArgumentException("ExternalJobLink field is required.");

    var profileSourceCount = 0;
    if (dto.ProfileId.HasValue) profileSourceCount++;
    if (dto.NewProfile != null) profileSourceCount++;
    if (dto.ManualProfileData != null) profileSourceCount++;

    if (profileSourceCount == 0)
      throw new ArgumentException("You must select a profile source: ProfileId, NewProfile, or ManualProfileData.");
    if (profileSourceCount > 1)
      throw new ArgumentException("You can only select one profile source.");

    // ── 2. Profile Resolution ──
    Profile? profile = null;
    Guid? savedProfileId = null;
    string profileTitle;
    string profileFullName;

    if (dto.ProfileId.HasValue)
    {
      // Scenario A: Use Existing Profile
      profile = await _profileRepository.GetWithDetailsByIdAsync(dto.ProfileId.Value);
      if (profile == null)
        throw new ArgumentException($"Profile not found: {dto.ProfileId.Value}");

      // ── 3. Authorization Check ──
      if (profile.UserId != authenticatedUserId)
        throw new UnauthorizedAccessException("You do not have permission to access this profile.");

      savedProfileId = profile.Id;
      profileTitle = profile.Title;
      profileFullName = profile.FullName;
    }
    else if (dto.NewProfile != null)
    {
      // Scenario B: Create New Profile 
      dto.NewProfile.UserId = authenticatedUserId;

      profile = new Profile
      {
        Id = Guid.NewGuid(),
        UserId = authenticatedUserId,
        ProfileName = dto.NewProfile.ProfileName,
        FullName = dto.NewProfile.FullName,
        Title = dto.NewProfile.Title,
        Summary = dto.NewProfile.Summary,
        Email = dto.NewProfile.Email,
        Phone = dto.NewProfile.Phone,
        ExperienceJson = dto.NewProfile.ExperienceJson,
        EducationJson = dto.NewProfile.EducationJson,
        Skills = dto.NewProfile.Skills,
        SocialLinks = dto.NewProfile.SocialLinks,
        PhotoUrl = dto.NewProfile.PhotoUrl,
        ShowPhoto = dto.NewProfile.ShowPhoto,
        CreatedAt = DateTime.UtcNow
      };

      await _profileRepository.AddAsync(profile);
      await _profileRepository.SaveChangesAsync();

      savedProfileId = profile.Id;
      profileTitle = profile.Title;
      profileFullName = profile.FullName;
    }
    else
    {
      // Scenario C: Manual Data
      var manual = dto.ManualProfileData!;
      savedProfileId = null; // Profile is not saved to DB.
      profileTitle = manual.Title;
      profileFullName = manual.FullName;
    }

    // ── 4. Create Resume ──
    var resume = new Resume
    {
      Id = Guid.NewGuid(),
      ProfileId = savedProfileId,
      ExternalJobLink = dto.ExternalJobLink,
      JobDescription = "Pending AI processing", // TODO(AI-Integration): Will be updated later.
      CreatedAt = DateTime.UtcNow
    };

    // ── 5. AI Generation (TODO) ──
    var targetLanguages = dto.SelectedLanguagesForGeneration?.Count > 0
        ? dto.SelectedLanguagesForGeneration
        : ["en"];

    foreach (var lang in targetLanguages)
    {
      // TODO(AI-Integration): 
      //   1. Parse job description from ExternalJobLink (scraping/API)
      //   2. Send job description + profile data (experience/education/skills) to AI
      //   3. Save AI-generated CV content to ResumeTranslation
      //
      // Placeholder data is currently used:
      resume.Translations.Add(new ResumeTranslation
      {
        ResumeId = resume.Id,
        LanguageCode = lang,
        Version = 1,
        Title = $"{profileFullName} - {profileTitle} ({lang.ToUpper()})",
        Summary = $"[AI-PLACEHOLDER] Generated summary in {lang} for {profileFullName}",
        ExperienceHtml = $"<p>[AI-PLACEHOLDER] Experience HTML in {lang}</p>",
        EducationHtml = $"<p>[AI-PLACEHOLDER] Education HTML in {lang}</p>",
        SkillsHtml = $"<p>[AI-PLACEHOLDER] Skills HTML in {lang}</p>",
        CreatedAt = DateTime.UtcNow
      });
    }

    // ── 6. Save and Return ──
    await _resumeRepository.AddAsync(resume);
    await _resumeRepository.SaveChangesAsync();

    return MapToDto(resume);
  }

  private static ResumeDto MapToDto(Resume r) => new()
  {
    Id = r.Id,
    ProfileId = r.ProfileId,
    ExternalJobLink = r.ExternalJobLink,
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
      SkillsHtml = t.SkillsHtml,
      Version = t.Version,
      CreatedAt = t.CreatedAt
    })]
  };
}
