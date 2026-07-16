using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services;

public class ResumeService(
    IResumeRepository resumeRepository,
    IProfileRepository profileRepository,
    IAiService aiService) : IResumeService
{
  private readonly IResumeRepository _resumeRepository = resumeRepository;
  private readonly IProfileRepository _profileRepository = profileRepository;
  private readonly IAiService _aiService = aiService;

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

  private static AiProfileInput MapToAiProfileInput(Profile p) => new()
  {
    FullName = p.FullName,
    Title = p.Title,
    Summary = p.Summary,
    Email = p.Email,
    Phone = p.Phone,
    Location = p.Location,
    Skills = p.Skills ?? [],
    Experiences = p.ProfileExperiences?
        .OrderBy(pe => pe.SortOrder)
        .Select(pe => new AiExperienceInput
        {
          CompanyName = pe.Experience?.CompanyName ?? string.Empty,
          Role = pe.Experience?.Role ?? string.Empty,
          StartDate = pe.Experience?.StartDate.ToString("yyyy-MM") ?? string.Empty,
          EndDate = pe.Experience?.EndDate?.ToString("yyyy-MM") ?? (pe.Experience?.IsOngoing == true ? "Present" : string.Empty),
          Description = pe.Experience?.Description ?? string.Empty
        }).ToList() ?? [],
    Educations = p.ProfileEducations?
        .OrderBy(pe => pe.SortOrder)
        .Select(pe => new AiEducationInput
        {
          SchoolName = pe.Education?.SchoolName ?? string.Empty,
          Degree = pe.Education?.Degree ?? string.Empty,
          FieldOfStudy = pe.Education?.FieldOfStudy ?? string.Empty,
          StartDate = pe.Education?.StartDate.ToString("yyyy-MM") ?? string.Empty,
          EndDate = pe.Education?.EndDate?.ToString("yyyy-MM") ?? (pe.Education?.IsOngoing == true ? "Present" : string.Empty),
          GPA = pe.Education?.GPA ?? string.Empty
        }).ToList() ?? [],
    Projects = p.ProfileProjects?
        .OrderBy(pp => pp.SortOrder)
        .Select(pp => new AiProjectInput
        {
          Title = pp.Project?.ProjectTitle ?? string.Empty,
          Description = pp.Project?.Description ?? string.Empty,
          TechologiesUsed = string.IsNullOrWhiteSpace(pp.Project?.TechologiesUsed) ? [] : pp.Project.TechologiesUsed.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList()
        }).ToList() ?? []
  };

  private static AiProfileInput MapManualToAiProfileInput(ManualProfileDataDto manual) => new()
  {
    FullName = manual.FullName,
    Title = manual.Title,
    Summary = manual.Summary,
    Email = manual.Email,
    Phone = manual.Phone,
    Location = string.Empty,
    Skills = manual.Skills ?? [],
    Experiences = manual.Experiences?
        .Select(de => new AiExperienceInput
        {
          CompanyName = de.CompanyName,
          Role = de.Role,
          StartDate = de.StartDate.ToString("yyyy-MM"),
          EndDate = de.EndDate?.ToString("yyyy-MM") ?? (de.IsOngoing ? "Present" : string.Empty),
          Description = de.Description
        }).ToList() ?? [],
    Educations = manual.Educations?
        .Select(de => new AiEducationInput
        {
          SchoolName = de.SchoolName,
          Degree = de.Degree,
          FieldOfStudy = de.FieldOfStudy,
          StartDate = de.StartDate.ToString("yyyy-MM"),
          EndDate = de.EndDate?.ToString("yyyy-MM") ?? (de.IsOngoing ? "Present" : string.Empty),
          GPA = de.GPA ?? string.Empty
        }).ToList() ?? [],
    Projects = manual.Projects?
        .Select(de => new AiProjectInput
        {
          Title = de.Title,
          Description = de.Description,
          TechologiesUsed = string.IsNullOrWhiteSpace(de.TechologiesUsed) ? [] : de.TechologiesUsed.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList()
        }).ToList() ?? []
  };

  /// <summary>
  /// CV Generation Process:
  /// 1. Validation (ExternalJobLink required, exactly 1 profile source)
  /// 2. Profile resolution (existing / new / manual)
  /// 3. Authorization check (if ProfileId is given, is it owned?)
  /// 4. AI integration (read job description + generate CV)
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

      Profile? detailedProfile = null;
      if (existingResume.ProfileId.HasValue)
      {
        detailedProfile = await _profileRepository.GetWithDetailsByIdAsync(existingResume.ProfileId.Value);
      }

      AiProfileInput aiProfile = detailedProfile != null
          ? MapToAiProfileInput(detailedProfile)
          : new AiProfileInput
          {
            FullName = existingResume.Profile?.FullName ?? "User",
            Title = existingResume.Profile?.Title ?? "Professional"
          };

      foreach (var lang in langs)
      {
        var currentMaxVersion = existingResume.Translations
            .Where(t => t.LanguageCode.Equals(lang, StringComparison.OrdinalIgnoreCase))
            .Select(t => t.Version)
            .DefaultIfEmpty(0)
            .Max();

        var nextVersion = currentMaxVersion + 1;

        // Generate customized CV using Gemini API
        var aiResult = await _aiService.GenerateResumeTranslationAsync(existingResume.ExternalJobLink, aiProfile, lang);

        existingResume.Translations.Add(new ResumeTranslation
        {
          ResumeId = existingResume.Id,
          LanguageCode = lang,
          Version = nextVersion,
          Title = aiResult.Title,
          Summary = aiResult.Summary,
          ExperienceHtml = aiResult.ExperienceHtml,
          EducationHtml = aiResult.EducationHtml,
          SkillsHtml = aiResult.SkillsHtml,
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
    }
    else if (dto.NewProfile != null)
    {
      // Scenario B: Create New Profile 
      var newProfile = dto.NewProfile with { UserId = authenticatedUserId };

      profile = new Profile
      {
        Id = Guid.NewGuid(),
        UserId = authenticatedUserId,
        ProfileName = newProfile.ProfileName,
        FullName = newProfile.FullName,
        Title = newProfile.Title,
        Summary = newProfile.Summary,
        Email = newProfile.Email,
        Phone = newProfile.Phone,
        ExperienceJson = newProfile.ExperienceJson,
        EducationJson = newProfile.EducationJson,
        Skills = newProfile.Skills,
        SocialLinks = newProfile.SocialLinks,
        PhotoUrl = newProfile.PhotoUrl,
        ShowPhoto = newProfile.ShowPhoto,
        CreatedAt = DateTime.UtcNow
      };

      await _profileRepository.AddAsync(profile);
      await _profileRepository.SaveChangesAsync();

      savedProfileId = profile.Id;
    }

    // ── 4. Create Resume ──
    var resume = new Resume
    {
      Id = Guid.NewGuid(),
      ProfileId = savedProfileId,
      ExternalJobLink = dto.ExternalJobLink,
      JobDescription = "Pending AI processing",
      CreatedAt = DateTime.UtcNow
    };

    // ── 5. AI Generation ──
    var targetLanguages = dto.SelectedLanguagesForGeneration?.Count > 0
        ? dto.SelectedLanguagesForGeneration
        : ["en"];

    AiProfileInput aiProfileInput = profile != null
        ? MapToAiProfileInput(profile)
        : MapManualToAiProfileInput(dto.ManualProfileData!);

    foreach (var lang in targetLanguages)
    {
      var aiResult = await _aiService.GenerateResumeTranslationAsync(dto.ExternalJobLink, aiProfileInput, lang);

      resume.Translations.Add(new ResumeTranslation
      {
        ResumeId = resume.Id,
        LanguageCode = lang,
        Version = 1,
        Title = aiResult.Title,
        Summary = aiResult.Summary,
        ExperienceHtml = aiResult.ExperienceHtml,
        EducationHtml = aiResult.EducationHtml,
        SkillsHtml = aiResult.SkillsHtml,
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
