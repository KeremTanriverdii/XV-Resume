using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services;

public class ProfileService(IProfileRepository profileRepository) : IProfileService
{
  private readonly IProfileRepository _profileRepository = profileRepository;

  public async Task<IEnumerable<ProfileDto>> GetProfilesByUserIdAsync(string userId)
  {
    var profiles = await _profileRepository.GetByUserIdAsync(userId);
    return profiles.Select(MapToDto);
  }

  public async Task<ProfileDto?> GetProfileByIdAsync(Guid id)
  {
    var profile = await _profileRepository.GetByIdAsync(id);
    if (profile == null) return null;
    return MapToDto(profile);
  }

  public async Task<ProfileDto> CreateProfileAsync(CreateProfileDto dto)
  {
    var profile = new Profile
    {
      Id = Guid.NewGuid(),
      UserId = dto.UserId,
      ProfileName = dto.ProfileName,
      FullName = dto.FullName,
      Title = dto.Title,
      Summary = dto.Summary,
      ExperienceJson = dto.ExperienceJson,
      EducationJson = dto.EducationJson,
      Skills = dto.Skills,
      SocialLinks = dto.SocialLinks,
      PhotoUrl = dto.PhotoUrl,
      ShowPhoto = dto.ShowPhoto,
      CreatedAt = DateTime.UtcNow
    };

    await _profileRepository.AddAsync(profile);
    await _profileRepository.SaveChangesAsync();

    return MapToDto(profile);
  }

  public async Task<ProfileDto?> UpdateProfileAsync(Guid id, CreateProfileDto dto)
  {
    var profile = await _profileRepository.GetByIdAsync(id);
    if (profile == null) return null;

    profile.ProfileName = dto.ProfileName;
    profile.FullName = dto.FullName;
    profile.Title = dto.Title;
    profile.Summary = dto.Summary;
    profile.ExperienceJson = dto.ExperienceJson;
    profile.EducationJson = dto.EducationJson;
    profile.Skills = dto.Skills;
    profile.SocialLinks = dto.SocialLinks;
    profile.PhotoUrl = dto.PhotoUrl;
    profile.ShowPhoto = dto.ShowPhoto;

    _profileRepository.Update(profile);
    await _profileRepository.SaveChangesAsync();

    return MapToDto(profile);
  }

  public async Task<bool> DeleteProfileAsync(Guid id)
  {
    var profile = await _profileRepository.GetByIdAsync(id);
    if (profile == null) return false;

    _profileRepository.Delete(profile);
    await _profileRepository.SaveChangesAsync();
    return true;
  }

  private static ProfileDto MapToDto(Profile p) => new()
  {
    Id = p.Id,
    UserId = p.UserId,
    ProfileName = p.ProfileName,
    FullName = p.FullName,
    Title = p.Title,
    Summary = p.Summary,
    ExperienceJson = p.ExperienceJson,
    EducationJson = p.EducationJson,
    Skills = p.Skills,
    SocialLinks = p.SocialLinks,
    PhotoUrl = p.PhotoUrl,
    ShowPhoto = p.ShowPhoto,
    CreatedAt = p.CreatedAt
  };
}
