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

public class AtsScanService(
    IAtsScanRepository atsScanRepository,
    IProfileRepository profileRepository,
    IUserRepository userRepository,
    IAiService aiService) : IAtsScanService
{
  private readonly IAtsScanRepository _atsScanRepository = atsScanRepository;
  private readonly IProfileRepository _profileRepository = profileRepository;
  private readonly IUserRepository _userRepository = userRepository;
  private readonly IAiService _aiService = aiService;

  public async Task<AtsScanDto> CreateScanAsync(CreateAtsScanDto dto, string userId)
  {
    Profile? profile = null;
    if (Guid.TryParse(dto.ProfileId, out var profileGuid))
    {
      profile = await _profileRepository.GetWithDetailsByIdAsync(profileGuid);
      if (profile != null && profile.UserId != userId)
        throw new UnauthorizedAccessException("You do not have permission to access this profile.");
    }

    AiProfileInput? aiProfile = profile != null ? MapToAiProfileInput(profile) : null;
    var aiResult = await _aiService.AnalyzeAtsAsync(dto.ExternalJobLink, aiProfile, dto.JobDescriptionText);

    var rawLink = dto.ExternalJobLink ?? string.Empty;
    var safeLink = rawLink.Length > 2000 ? rawLink[..2000] : rawLink;

    var scan = new AtsScan
    {
      Id = Guid.NewGuid(),
      UserId = userId,
      ProfileId = profile?.Id,
      JobTitle = string.IsNullOrWhiteSpace(aiResult.ScrapedJobTitle) ? "Target Job Position" : aiResult.ScrapedJobTitle,
      ExternalJobLink = safeLink,
      JobDescription = string.IsNullOrWhiteSpace(dto.JobDescriptionText) ? aiResult.ScrapedJobDescription : dto.JobDescriptionText,
      MatchPercentage = aiResult.MatchPercentage,
      MatchedSkillsJson = JsonSerializer.Serialize(aiResult.MatchedSkills),
      MissingSkillsJson = JsonSerializer.Serialize(aiResult.MissingSkills),
      CriticalMissingSkillsJson = JsonSerializer.Serialize(aiResult.CriticalMissingSkills),
      RecommendedMissingSkillsJson = JsonSerializer.Serialize(aiResult.RecommendedMissingSkills),
      AtsFeedback = aiResult.AtsFeedback ?? string.Empty,
      CreatedAt = DateTime.UtcNow
    };

    await _atsScanRepository.AddAsync(scan);
    await _atsScanRepository.SaveChangesAsync();

    return MapToDto(scan, profile);
  }

  public async Task<IEnumerable<AtsScanDto>> GetUserScansAsync(string userId, int page = 1, int pageSize = 10)
  {
    var scans = await _atsScanRepository.GetPagedByUserIdAsync(userId, page, pageSize);
    return scans.Select(s => MapToDto(s, s.Profile));
  }

  public async Task<AtsScanDto?> GetScanByIdAsync(Guid id)
  {
    var scan = await _atsScanRepository.GetByIdWithProfileAsync(id);
    return scan == null ? null : MapToDto(scan, scan.Profile);
  }

  public async Task<bool> DeleteScanAsync(Guid id, string userId)
  {
    var scan = await _atsScanRepository.GetByIdAsync(id);
    if (scan == null) return false;
    if (scan.UserId != userId) throw new UnauthorizedAccessException("You do not have permission to delete this analysis.");

    _atsScanRepository.Delete(scan);
    await _atsScanRepository.SaveChangesAsync();
    return true;
  }

  private static AtsScanDto MapToDto(AtsScan scan, Profile? profile)
  {
    return new AtsScanDto
    {
      Id = scan.Id,
      UserId = scan.UserId,
      ProfileId = scan.ProfileId,
      JobTitle = scan.JobTitle,
      ExternalJobLink = scan.ExternalJobLink,
      JobDescription = scan.JobDescription,
      MatchPercentage = scan.MatchPercentage,
      MatchedSkills = DeserializeSkillsJson(scan.MatchedSkillsJson),
      MissingSkills = DeserializeSkillsJson(scan.MissingSkillsJson),
      CriticalMissingSkills = DeserializeSkillsJson(scan.CriticalMissingSkillsJson),
      RecommendedMissingSkills = DeserializeSkillsJson(scan.RecommendedMissingSkillsJson),
      AtsFeedback = scan.AtsFeedback,
      CreatedAt = scan.CreatedAt,
      Profile = profile == null ? null : MapProfileToDto(profile)
    };
  }

  private static List<string> DeserializeSkillsJson(string? json)
  {
    if (string.IsNullOrWhiteSpace(json)) return [];
    try
    {
      return JsonSerializer.Deserialize<List<string>>(json) ?? [];
    }
    catch
    {
      return [];
    }
  }

  private static ProfileDto MapProfileToDto(Profile p) => new()
  {
    Id = p.Id,
    UserId = p.UserId,
    ProfileName = p.ProfileName,
    FullName = p.FullName,
    Title = p.Title,
    Summary = p.Summary,
    Email = p.Email,
    Phone = p.Phone,
    Location = p.Location,
    Skills = p.Skills ?? [],
    SocialLinks = p.SocialLinks ?? [],
    PhotoUrl = p.PhotoUrl,
    ShowPhoto = p.ShowPhoto,
    CreatedAt = p.CreatedAt,
    Languages = p.Languages ?? []
  };

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
}
