using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services;

public class ResumeService(
    IResumeRepository resumeRepository,
    IProfileRepository profileRepository,
    IUserRepository userRepository,
    IAiService aiService) : IResumeService
{
  private readonly IResumeRepository _resumeRepository = resumeRepository;
  private readonly IProfileRepository _profileRepository = profileRepository;
  private readonly IUserRepository _userRepository = userRepository;
  private readonly IAiService _aiService = aiService;

  public async Task<IEnumerable<ResumeDto>> GetAllResumesAsync(string? userId = null, int page = 1, int pageSize = 10)
  {
    var resumes = !string.IsNullOrWhiteSpace(userId)
        ? await _resumeRepository.GetPagedByUserIdWithTranslationsAsync(userId, page, pageSize)
        : await _resumeRepository.GetAllWithTranslationsAsync();

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
    MilitaryStatus = p.MilitaryStatus.ToString(),
    PostponedUntil = p.MilitaryPostponedUntil?.ToString("yyyy-MM-dd"),
    PhotoUrl = p.ShowPhoto ? p.PhotoUrl : null,
    Languages = p.Languages ?? [],
    SocialLinks = string.Join("\n", p.SocialLinks ?? []),
    Skills = p.Skills ?? [],
    Experiences = MapExperiencesForAi(p),
    Educations = MapEducationsForAi(p),
    Projects = p.ProfileProjects?
        .OrderBy(pp => pp.SortOrder)
        .Select(pp => new AiProjectInput
        {
          Title = pp.Project?.ProjectTitle ?? string.Empty,
          Description = pp.Project?.Description ?? string.Empty,
          TechologiesUsed = string.IsNullOrWhiteSpace(pp.Project?.TechologiesUsed) ? [] : pp.Project.TechologiesUsed.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
          Links = pp.Project?.Links,
          RepositoryUrl = pp.Project?.RepositoryUrl
        }).ToList() ?? []
  };

  private static List<AiExperienceInput> MapExperiencesForAi(Profile p)
  {
    var listFromRel = p.ProfileExperiences?
        .OrderBy(pe => pe.SortOrder)
        .Select(pe => new AiExperienceInput
        {
          CompanyName = pe.Experience?.CompanyName ?? string.Empty,
          Role = pe.Experience?.Role ?? string.Empty,
          StartDate = pe.Experience?.StartDate.ToString("yyyy-MM") ?? string.Empty,
          EndDate = pe.Experience?.EndDate?.ToString("yyyy-MM") ?? (pe.Experience?.IsOngoing == true ? "Present" : string.Empty),
          Description = pe.Experience?.Description ?? string.Empty
        })
        .Where(e => !string.IsNullOrWhiteSpace(e.CompanyName) || !string.IsNullOrWhiteSpace(e.Role))
        .ToList();

    if (listFromRel != null && listFromRel.Count > 0) return listFromRel;

    if (!string.IsNullOrWhiteSpace(p.ExperienceJson))
    {
      try
      {
        using var doc = JsonDocument.Parse(p.ExperienceJson);
        if (doc.RootElement.ValueKind == JsonValueKind.Array)
        {
          var jsonList = new List<AiExperienceInput>();
          foreach (var el in doc.RootElement.EnumerateArray())
          {
            var company = el.TryGetProperty("companyName", out var c) || el.TryGetProperty("CompanyName", out c) ? c.GetString() : string.Empty;
            var role = el.TryGetProperty("role", out var r) || el.TryGetProperty("Role", out r) ? r.GetString() : string.Empty;
            var desc = el.TryGetProperty("description", out var d) || el.TryGetProperty("Description", out d) ? d.GetString() : string.Empty;
            var start = el.TryGetProperty("startDate", out var s) || el.TryGetProperty("StartDate", out s) ? s.GetString() : string.Empty;
            var end = el.TryGetProperty("endDate", out var e) || el.TryGetProperty("EndDate", out e) ? e.GetString() : string.Empty;

            jsonList.Add(new AiExperienceInput
            {
              CompanyName = company ?? string.Empty,
              Role = role ?? string.Empty,
              StartDate = start ?? string.Empty,
              EndDate = end ?? string.Empty,
              Description = desc ?? string.Empty
            });
          }
          if (jsonList.Count > 0) return jsonList;
        }
      }
      catch { }
    }

    return [];
  }

  private static List<AiEducationInput> MapEducationsForAi(Profile p)
  {
    var listFromRel = p.ProfileEducations?
        .OrderBy(pe => pe.SortOrder)
        .Select(pe => new AiEducationInput
        {
          SchoolName = pe.Education?.SchoolName ?? string.Empty,
          Degree = pe.Education?.Degree ?? string.Empty,
          FieldOfStudy = pe.Education?.FieldOfStudy ?? string.Empty,
          StartDate = pe.Education?.StartDate.ToString("yyyy-MM") ?? string.Empty,
          EndDate = pe.Education?.EndDate?.ToString("yyyy-MM") ?? (pe.Education?.IsOngoing == true ? "Present" : string.Empty),
          GPA = pe.Education?.GPA ?? string.Empty
        })
        .Where(e => !string.IsNullOrWhiteSpace(e.SchoolName) || !string.IsNullOrWhiteSpace(e.Degree))
        .ToList();

    if (listFromRel != null && listFromRel.Count > 0) return listFromRel;

    if (!string.IsNullOrWhiteSpace(p.EducationJson))
    {
      try
      {
        using var doc = JsonDocument.Parse(p.EducationJson);
        if (doc.RootElement.ValueKind == JsonValueKind.Array)
        {
          var jsonList = new List<AiEducationInput>();
          foreach (var el in doc.RootElement.EnumerateArray())
          {
            var school = el.TryGetProperty("schoolName", out var s) || el.TryGetProperty("SchoolName", out s) ? s.GetString() : string.Empty;
            var degree = el.TryGetProperty("degree", out var d) || el.TryGetProperty("Degree", out d) ? d.GetString() : string.Empty;
            var field = el.TryGetProperty("fieldOfStudy", out var f) || el.TryGetProperty("FieldOfStudy", out f) ? f.GetString() : string.Empty;
            var start = el.TryGetProperty("startDate", out var st) || el.TryGetProperty("StartDate", out st) ? st.GetString() : string.Empty;
            var end = el.TryGetProperty("endDate", out var en) || el.TryGetProperty("EndDate", out en) ? en.GetString() : string.Empty;
            var gpa = el.TryGetProperty("gpa", out var g) || el.TryGetProperty("GPA", out g) ? g.GetString() : string.Empty;

            jsonList.Add(new AiEducationInput
            {
              SchoolName = school ?? string.Empty,
              Degree = degree ?? string.Empty,
              FieldOfStudy = field ?? string.Empty,
              StartDate = start ?? string.Empty,
              EndDate = end ?? string.Empty,
              GPA = gpa ?? string.Empty
            });
          }
          if (jsonList.Count > 0) return jsonList;
        }
      }
      catch { }
    }

    return [];
  }

  private static AiProfileInput MapManualToAiProfileInput(ManualProfileDataDto manual) => new()
  {
    FullName = manual.FullName,
    Title = manual.Title,
    Summary = manual.Summary,
    Email = manual.Email,
    Phone = manual.Phone,
    Location = string.Empty,
    MilitaryStatus = string.Empty,
    PostponedUntil = string.Empty,
    PhotoUrl = string.Empty,
    Languages = [],
    SocialLinks = manual.SocialLinks ?? string.Empty,
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
    var userObj = await _userRepository.GetByIdAsync(authenticatedUserId);
    if (userObj == null)
    {
      userObj = new User
      {
        Id = authenticatedUserId,
        SubscriptionsStatus = "Inactive"
      };
      await _userRepository.AddAsync(userObj);
      await _userRepository.SaveChangesAsync();
    }

    if (!userObj.CanGenerateResume)
    {
      throw new InvalidOperationException("Active subscription required. Please subscribe to Pro to continue generating resumes.");
    }

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

      var regenTasks = langs.Select(async lang =>
      {
        var aiResult = await _aiService.GenerateResumeTranslationAsync(existingResume.ExternalJobLink, aiProfile, lang);
        return (Lang: lang, Result: aiResult);
      });

      var regenResults = await Task.WhenAll(regenTasks);

      foreach (var item in regenResults)
      {
        var lang = item.Lang;
        var aiResult = item.Result;
        existingResume.JobDescription = aiResult.ScrapedJobDescription;

        var currentMaxVersion = existingResume.Translations
            .Where(t => t.LanguageCode.Equals(lang, StringComparison.OrdinalIgnoreCase))
            .Select(t => t.Version)
            .DefaultIfEmpty(0)
            .Max();

        var nextVersion = currentMaxVersion + 1;

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
          LanguagesHtml = aiResult.LanguagesHtml,
          ProjectsHtml = aiResult.ProjectsHtml,
          MatchPercentage = aiResult.MatchPercentage,
          AtsFeedback = aiResult.AtsFeedback,
          MatchedSkillsJson = JsonSerializer.Serialize(aiResult.MatchedSkills),
          MissingSkillsJson = JsonSerializer.Serialize(aiResult.MissingSkills),
          CriticalMissingSkillsJson = JsonSerializer.Serialize(aiResult.CriticalMissingSkills),
          RecommendedMissingSkillsJson = JsonSerializer.Serialize(aiResult.RecommendedMissingSkills),
          CoverLetter = aiResult.CoverLetter,
          ColdMessage = aiResult.ColdMessage,
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
        CreatedAt = DateTime.UtcNow,
        Location = newProfile.Location,
        Languages = newProfile.Languages,
        MilitaryStatus = newProfile.MilitaryStatus ?? Domain.Enums.MilitaryStatus.None,
        MilitaryPostponedUntil = newProfile.MilitaryPostponedUntil
      };

      await _profileRepository.AddAsync(profile);
      await _profileRepository.SaveChangesAsync();

      savedProfileId = profile.Id;
    }

    // ── 4. Create Resume ──
    var safeJobLink = dto.ExternalJobLink.Length > 2000
        ? dto.ExternalJobLink[..2000]
        : dto.ExternalJobLink;

    var resume = new Resume
    {
      Id = Guid.NewGuid(),
      ProfileId = savedProfileId,
      ExternalJobLink = safeJobLink,
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

    var genTasks = targetLanguages.Select(async lang =>
    {
      var aiResult = await _aiService.GenerateResumeTranslationAsync(dto.ExternalJobLink, aiProfileInput, lang);
      return (Lang: lang, Result: aiResult);
    });

    var genResults = await Task.WhenAll(genTasks);

    foreach (var item in genResults)
    {
      var lang = item.Lang;
      var aiResult = item.Result;
      resume.JobDescription = aiResult.ScrapedJobDescription;

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
        LanguagesHtml = aiResult.LanguagesHtml,
        ProjectsHtml = aiResult.ProjectsHtml,
        MatchPercentage = aiResult.MatchPercentage,
        AtsFeedback = aiResult.AtsFeedback,
        MatchedSkillsJson = JsonSerializer.Serialize(aiResult.MatchedSkills),
        MissingSkillsJson = JsonSerializer.Serialize(aiResult.MissingSkills),
        CriticalMissingSkillsJson = JsonSerializer.Serialize(aiResult.CriticalMissingSkills),
        RecommendedMissingSkillsJson = JsonSerializer.Serialize(aiResult.RecommendedMissingSkills),
        CoverLetter = aiResult.CoverLetter,
        ColdMessage = aiResult.ColdMessage,
        CreatedAt = DateTime.UtcNow
      });
    }

    // ── 6. Save and Return ──
    await _resumeRepository.AddAsync(resume);
    await _resumeRepository.SaveChangesAsync();

    resume.Profile = profile;
    return MapToDto(resume);
  }

  public async Task<bool> DeleteResumeAsync(Guid id, string authenticatedUserId)
  {
    var resume = await _resumeRepository.GetWithTranslationsByIdAsync(id);
    if (resume == null) return false;

    if (resume.ProfileId.HasValue)
    {
      var profile = await _profileRepository.GetByIdAsync(resume.ProfileId.Value);
      if (profile != null && profile.UserId != authenticatedUserId)
      {
        throw new UnauthorizedAccessException("You do not have permission to delete this resume.");
      }
    }

    _resumeRepository.Delete(resume);
    await _resumeRepository.SaveChangesAsync();
    return true;
  }

  public async Task<ResumeTranslationDto?> UpdateResumeTranslationAsync(Guid resumeId, int translationId, UpdateResumeTranslationDto dto, string authenticatedUserId)
  {
    var resume = await _resumeRepository.GetWithTranslationsByIdAsync(resumeId);
    if (resume == null) return null;

    if (resume.ProfileId.HasValue)
    {
      var profile = await _profileRepository.GetByIdAsync(resume.ProfileId.Value);
      if (profile != null && profile.UserId != authenticatedUserId)
      {
        throw new UnauthorizedAccessException("You do not have permission to modify this resume.");
      }
    }

    var translation = resume.Translations.FirstOrDefault(t => t.Id == translationId);
    if (translation == null) return null;

    if (dto.Title != null) translation.Title = dto.Title;
    if (dto.Summary != null) translation.Summary = dto.Summary;
    if (dto.ExperienceHtml != null) translation.ExperienceHtml = dto.ExperienceHtml;
    if (dto.EducationHtml != null) translation.EducationHtml = dto.EducationHtml;
    if (dto.SkillsHtml != null) translation.SkillsHtml = dto.SkillsHtml;
    if (dto.LanguagesHtml != null) translation.LanguagesHtml = dto.LanguagesHtml;
    if (dto.ProjectsHtml != null) translation.ProjectsHtml = dto.ProjectsHtml;
    if (dto.CoverLetter != null) translation.CoverLetter = dto.CoverLetter;
    if (dto.ColdMessage != null) translation.ColdMessage = dto.ColdMessage;

    await _resumeRepository.SaveChangesAsync();

    return new ResumeTranslationDto
    {
      Id = translation.Id,
      ResumeId = translation.ResumeId,
      LanguageCode = translation.LanguageCode,
      Title = translation.Title,
      Summary = translation.Summary,
      ExperienceHtml = translation.ExperienceHtml,
      EducationHtml = translation.EducationHtml,
      SkillsHtml = translation.SkillsHtml,
      LanguagesHtml = translation.LanguagesHtml,
      ProjectsHtml = translation.ProjectsHtml,
      MatchPercentage = translation.MatchPercentage,
      AtsFeedback = translation.AtsFeedback,
      MatchedSkills = DeserializeSkillsJson(translation.MatchedSkillsJson),
      MissingSkills = DeserializeSkillsJson(translation.MissingSkillsJson),
      CriticalMissingSkills = DeserializeSkillsJson(translation.CriticalMissingSkillsJson),
      RecommendedMissingSkills = DeserializeSkillsJson(translation.RecommendedMissingSkillsJson),
      CoverLetter = translation.CoverLetter,
      ColdMessage = translation.ColdMessage,
      Version = translation.Version,
      CreatedAt = translation.CreatedAt
    };
  }

  public async Task<AtsAnalysisResultDto> AnalyzeAtsAsync(AtsAnalysisRequestDto dto, string authenticatedUserId)
  {
    if (string.IsNullOrWhiteSpace(dto.ExternalJobLink) && string.IsNullOrWhiteSpace(dto.JobDescriptionText))
    {
      throw new ArgumentException("ExternalJobLink or JobDescriptionText is required.");
    }

    var profile = await _profileRepository.GetWithDetailsByIdAsync(dto.ProfileId);
    if (profile == null)
    {
      throw new ArgumentException($"Profile not found: {dto.ProfileId}");
    }

    if (profile.UserId != authenticatedUserId)
    {
      throw new UnauthorizedAccessException("You do not have permission to access this profile.");
    }

    // Check Subscription & Pro Status
    var userObj = await _userRepository.GetByIdAsync(authenticatedUserId);
    if (userObj == null)
    {
      userObj = new User
      {
        Id = authenticatedUserId,
        SubscriptionsStatus = "Inactive"
      };
      await _userRepository.AddAsync(userObj);
      await _userRepository.SaveChangesAsync();
    }

    if (!userObj.CanGenerateResume)
    {
      throw new InvalidOperationException("Active subscription required. Please subscribe to Pro to access ATS analysis.");
    }

    var aiProfile = MapToAiProfileInput(profile);
    var result = await _aiService.AnalyzeAtsAsync(dto.ExternalJobLink, aiProfile, dto.JobDescriptionText, dto.LanguageCode);

    return new AtsAnalysisResultDto
    {
      MatchPercentage = result.MatchPercentage,
      MatchedSkills = result.MatchedSkills,
      MissingSkills = result.MissingSkills,
      CriticalMissingSkills = result.CriticalMissingSkills,
      RecommendedMissingSkills = result.RecommendedMissingSkills,
      AtsFeedback = result.AtsFeedback,
      ScrapedJobTitle = result.ScrapedJobTitle,
      ScrapedJobDescription = result.ScrapedJobDescription
    };
  }

  private static ResumeDto MapToDto(Resume r) => new()
  {
    Id = r.Id,
    ProfileId = r.ProfileId,
    ExternalJobLink = r.ExternalJobLink,
    JobDescription = r.JobDescription,
    CreatedAt = r.CreatedAt,
    Profile = MapProfileToDto(r.Profile),
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
      LanguagesHtml = t.LanguagesHtml,
      ProjectsHtml = t.ProjectsHtml,
      MatchPercentage = t.MatchPercentage,
      AtsFeedback = t.AtsFeedback,
      MatchedSkills = DeserializeSkillsJson(t.MatchedSkillsJson),
      MissingSkills = DeserializeSkillsJson(t.MissingSkillsJson),
      CriticalMissingSkills = DeserializeSkillsJson(t.CriticalMissingSkillsJson),
      RecommendedMissingSkills = DeserializeSkillsJson(t.RecommendedMissingSkillsJson),
      CoverLetter = t.CoverLetter,
      ColdMessage = t.ColdMessage,
      Version = t.Version,
      CreatedAt = t.CreatedAt
    })]
  };

  private static ProfileDto? MapProfileToDto(Profile? p)
  {
    if (p == null) return null;
    return new ProfileDto
    {
      Id = p.Id,
      UserId = p.UserId,
      ProfileName = p.ProfileName,
      FullName = p.FullName,
      Title = p.Title,
      Summary = p.Summary,
      Email = p.Email,
      Phone = p.Phone,
      ExperienceJson = p.ExperienceJson,
      EducationJson = p.EducationJson,
      Skills = p.Skills,
      SocialLinks = p.SocialLinks,
      PhotoUrl = p.PhotoUrl,
      ShowPhoto = p.ShowPhoto,
      CreatedAt = p.CreatedAt,
      Location = p.Location,
      Languages = p.Languages,
      MilitaryStatus = p.MilitaryStatus,
      MilitaryPostponedUntil = p.MilitaryPostponedUntil,
      Projects = p.ProfileProjects?
        .OrderBy(pp => pp.SortOrder)
        .Select(pp => new ProjectDto
        {
          Id = pp.ProjectId,
          ProfileId = pp.ProfileId,
          Title = pp.Project?.ProjectTitle ?? string.Empty,
          Description = pp.Project?.Description ?? string.Empty,
          TechologiesUsed = pp.Project?.TechologiesUsed,
          Links = pp.Project?.Links,
          RepositoryUrl = pp.Project?.RepositoryUrl
        }).ToList() ?? [],
      Educations = p.ProfileEducations?
        .OrderBy(pe => pe.SortOrder)
        .Select(pe => new EducationDto
        {
          Id = pe.EducationId,
          ProfileId = pe.ProfileId,
          SchoolName = pe.Education?.SchoolName ?? string.Empty,
          Degree = pe.Education?.Degree ?? string.Empty,
          FieldOfStudy = pe.Education?.FieldOfStudy ?? string.Empty,
          StartDate = pe.Education?.StartDate ?? DateTime.MinValue,
          EndDate = pe.Education?.EndDate ?? DateTime.MinValue,
          GPA = pe.Education?.GPA
        }).ToList() ?? [],
      Experiences = p.ProfileExperiences?
        .OrderBy(pe => pe.SortOrder)
        .Select(pe => new ExperienceDto
        {
          Id = pe.ExperienceId,
          ProfileId = pe.ProfileId,
          CompanyName = pe.Experience?.CompanyName ?? string.Empty,
          Role = pe.Experience?.Role ?? string.Empty,
          StartDate = pe.Experience?.StartDate ?? DateTime.MinValue,
          EndDate = pe.Experience?.EndDate ?? DateTime.MinValue,
          Description = pe.Experience?.Description ?? string.Empty,
          LogoUrl = pe.Experience?.LogoUrl,
          Location = pe.Experience?.Location
        }).ToList() ?? []
    };
  }

  private static List<string> DeserializeSkillsJson(string? json)
  {
    if (string.IsNullOrWhiteSpace(json)) return [];
    try { return JsonSerializer.Deserialize<List<string>>(json) ?? []; }
    catch { return []; }
  }
}
