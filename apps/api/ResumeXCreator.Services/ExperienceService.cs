using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services;

public class ExperienceService(IExperienceRepository expRepository, IProfileRepository profileRepository) : IExperienceService
{
  private readonly IExperienceRepository _expRepository = expRepository;
  private readonly IProfileRepository _profileRepository = profileRepository;

  public async Task<ExperienceDto> CreateExperienceAsync(string userId, CreateExperienceDto dto)
  {
    if (dto.ProfileId.HasValue && dto.ProfileId.Value != Guid.Empty)
    {
      var profile = await _profileRepository.GetByIdAsync(dto.ProfileId.Value);
      userId = profile?.UserId;
    }

    var experience = new Experience
    {
      Id = Guid.NewGuid(),
      UserId = userId,
      CompanyName = dto.CompanyName,
      Role = dto.Role,
      StartDate = dto.StartDate,
      EndDate = dto.EndDate,
      Description = dto.Description,
      LogoUrl = dto.LogoUrl,
      Location = dto.Location
    };

    await _expRepository.AddAsync(experience);
    await _expRepository.SaveChangesAsync();

    // If profile is provided, create the many-to-many linkage
    if (dto.ProfileId.HasValue && dto.ProfileId.Value != Guid.Empty)
    {
      var profile = await _profileRepository.GetWithDetailsByIdAsync(dto.ProfileId.Value);
      if (profile != null)
      {
        int sortOrder = profile.ProfileExperiences.Count;
        profile.ProfileExperiences.Add(new ProfileExperience
        {
          ProfileId = profile.Id,
          ExperienceId = experience.Id,
          SortOrder = sortOrder
        });
        _profileRepository.Update(profile);
        await _profileRepository.SaveChangesAsync();
      }
    }

    return MapToDto(experience, dto.ProfileId);
  }

  public async Task<bool> DeleteExperienceAsync(string userId, Guid id)
  {
    var experience = await _expRepository.GetByIdAsync(id);
    if (experience == null || experience.UserId != userId) return false;

    _expRepository.Delete(experience);
    await _expRepository.SaveChangesAsync();
    return true;
  }

  public async Task<IEnumerable<ExperienceDto>> GetExperienceByProfileIdAsync(Guid profileId)
  {
    var profile = await _profileRepository.GetWithDetailsByIdAsync(profileId);
    if (profile == null) return [];

    return profile.ProfileExperiences
        .OrderBy(pe => pe.SortOrder)
        .Select(pe => MapToDto(pe.Experience!, profileId))
        .ToList();
  }

  public async Task<ExperienceDto?> GetExperienceByIdAsync(string userId, Guid id)
  {
    var experience = await _expRepository.GetByIdAsync(id);
    if (experience == null || experience.UserId != userId) return null;
    return MapToDto(experience);
  }

  public async Task<ExperienceDto?> UpdateExperienceAsync(string userId, Guid id, CreateExperienceDto dto)
  {
    var experience = await _expRepository.GetByIdAsync(id);

    if (experience?.UserId != userId) return null;

    experience.CompanyName = dto.CompanyName;
    experience.Role = dto.Role;
    experience.StartDate = dto.StartDate;
    experience.EndDate = dto.EndDate;
    experience.Description = dto.Description;
    experience.LogoUrl = dto.LogoUrl;
    experience.Location = dto.Location;

    _expRepository.Update(experience);
    await _expRepository.SaveChangesAsync();

    return MapToDto(experience, dto.ProfileId);
  }

  public async Task<IEnumerable<ExperienceDto>> GetExperiencesByUserIdAsync(string userId)
  {
    var experiences = await _expRepository.GetByUserIdAsync(userId);
    return experiences.Select(e => MapToDto(e));
  }

  public async Task<IEnumerable<ExperienceDto>> GetSuggestedExperiencesAsync(Guid profileId)
  {
    var profile = await _profileRepository.GetWithDetailsByIdAsync(profileId);
    if (profile == null || string.IsNullOrEmpty(profile.Title) || string.IsNullOrEmpty(profile.UserId))
      return [];

    // Get all user's experiences
    var allExperiences = await _expRepository.GetByUserIdAsync(profile.UserId);

    // Filter out experiences already linked to this profile
    var linkedExperienceIds = profile.ProfileExperiences.Select(pe => pe.ExperienceId).ToHashSet();
    var unlinkedExperiences = allExperiences.Where(e => !linkedExperienceIds.Contains(e.Id));

    // Tokenize keywords
    var keywords = profile.Title.ToLower()
        .Split(new[] { ' ', '-', '/', ',', '.' }, StringSplitOptions.RemoveEmptyEntries)
        .Where(w => w.Length > 2)
        .ToList();

    if (keywords.Count == 0)
      return [];

    // Filter experiences matching keywords in role, company or description
    var suggested = unlinkedExperiences.Where(exp =>
        keywords.Any(kw =>
            (exp.Role != null && exp.Role.ToLower().Contains(kw)) ||
            (exp.CompanyName != null && exp.CompanyName.ToLower().Contains(kw)) ||
            (exp.Description != null && exp.Description.ToLower().Contains(kw))
        )
    ).ToList();

    return suggested.Select(e => MapToDto(e, profileId));
  }

  public static ExperienceDto MapToDto(Experience e, Guid? profileId = null) => new()
  {
    Id = e.Id,
    ProfileId = profileId,
    CompanyName = e.CompanyName,
    Role = e.Role,
    StartDate = e.StartDate,
    EndDate = e.EndDate,
    Description = e.Description,
    LogoUrl = e.LogoUrl,
    Location = e.Location
  };
}