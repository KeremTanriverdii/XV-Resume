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
    var profile = await _profileRepository.GetWithDetailsByIdAsync(id);
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
      Email = dto.Email,
      Phone = dto.Phone,
      ExperienceJson = dto.ExperienceJson,
      EducationJson = dto.EducationJson,
      Skills = dto.Skills,
      SocialLinks = dto.SocialLinks,
      PhotoUrl = dto.PhotoUrl,
      ShowPhoto = dto.ShowPhoto,
      CreatedAt = DateTime.UtcNow
    };

    if (dto.Projects != null)
    {
      foreach (var pr in dto.Projects)
      {
        profile.Projects.Add(new Project
        {
          Id = pr.Id == Guid.Empty ? Guid.NewGuid() : pr.Id,
          ProfileId = profile.Id,
          ProjectTitle = pr.Title,
          Description = pr.Description,
          TechologiesUsed = pr.TechologiesUsed,
          Links = pr.Links,
          RepositoryUrl = pr.RepositoryUrl
        });
      }
    }

    if (dto.Educations != null)
    {
      foreach (var ed in dto.Educations)
      {
        profile.Educations.Add(new Education
        {
          Id = ed.Id == Guid.Empty ? Guid.NewGuid() : ed.Id,
          ProfileId = profile.Id,
          SchoolName = ed.SchoolName,
          Degree = ed.Degree,
          FieldOfStudy = ed.FieldOfStudy,
          StartDate = ed.StartDate,
          EndDate = ed.EndDate,
          GPA = ed.GPA
        });
      }
    }

    if (dto.Experiences != null)
    {
      foreach (var ex in dto.Experiences)
      {
        profile.Experiences.Add(new Experience
        {
          Id = ex.Id == Guid.Empty ? Guid.NewGuid() : ex.Id,
          ProfileId = profile.Id,
          CompanyName = ex.CompanyName,
          Role = ex.Role,
          StartDate = ex.StartDate,
          EndDate = ex.EndDate,
          Description = ex.Description,
          LogoUrl = ex.LogoUrl,
          Location = ex.Location
        });
      }
    }

    await _profileRepository.AddAsync(profile);
    await _profileRepository.SaveChangesAsync();

    return MapToDto(profile);
  }

  public async Task<ProfileDto?> UpdateProfileAsync(Guid id, CreateProfileDto dto)
  {
    var profile = await _profileRepository.GetWithDetailsByIdAsync(id);
    if (profile == null) return null;

    profile.ProfileName = dto.ProfileName;
    profile.FullName = dto.FullName;
    profile.Title = dto.Title;
    profile.Summary = dto.Summary;
    profile.Email = dto.Email;
    profile.Phone = dto.Phone;
    profile.ExperienceJson = dto.ExperienceJson;
    profile.EducationJson = dto.EducationJson;
    profile.Skills = dto.Skills;
    profile.SocialLinks = dto.SocialLinks;
    profile.PhotoUrl = dto.PhotoUrl;
    profile.ShowPhoto = dto.ShowPhoto;

    // --- Update Projects ---
    if (dto.Projects != null)
    {
      var projectsToRemove = profile.Projects.Where(p => !dto.Projects.Any(dp => dp.Id == p.Id)).ToList();
      foreach (var p in projectsToRemove)
      {
        profile.Projects.Remove(p);
      }

      foreach (var dp in dto.Projects)
      {
        var existing = profile.Projects.FirstOrDefault(p => p.Id == dp.Id);
        if (existing != null)
        {
          existing.ProjectTitle = dp.Title;
          existing.Description = dp.Description;
          existing.TechologiesUsed = dp.TechologiesUsed;
          existing.Links = dp.Links;
          existing.RepositoryUrl = dp.RepositoryUrl;
        }
        else
        {
          profile.Projects.Add(new Project
          {
            Id = dp.Id == Guid.Empty ? Guid.NewGuid() : dp.Id,
            ProfileId = profile.Id,
            ProjectTitle = dp.Title,
            Description = dp.Description,
            TechologiesUsed = dp.TechologiesUsed,
            Links = dp.Links,
            RepositoryUrl = dp.RepositoryUrl
          });
        }
      }
    }

    // --- Update Educations ---
    if (dto.Educations != null)
    {
      var educationsToRemove = profile.Educations.Where(e => !dto.Educations.Any(de => de.Id == e.Id)).ToList();
      foreach (var e in educationsToRemove)
      {
        profile.Educations.Remove(e);
      }

      foreach (var de in dto.Educations)
      {
        var existing = profile.Educations.FirstOrDefault(e => e.Id == de.Id);
        if (existing != null)
        {
          existing.SchoolName = de.SchoolName;
          existing.Degree = de.Degree;
          existing.FieldOfStudy = de.FieldOfStudy;
          existing.StartDate = de.StartDate;
          existing.EndDate = de.EndDate;
          existing.GPA = de.GPA;
        }
        else
        {
          profile.Educations.Add(new Education
          {
            Id = de.Id == Guid.Empty ? Guid.NewGuid() : de.Id,
            ProfileId = profile.Id,
            SchoolName = de.SchoolName,
            Degree = de.Degree,
            FieldOfStudy = de.FieldOfStudy,
            StartDate = de.StartDate,
            EndDate = de.EndDate,
            GPA = de.GPA
          });
        }
      }
    }

    // --- Update Experiences ---
    if (dto.Experiences != null)
    {
      var experiencesToRemove = profile.Experiences.Where(e => !dto.Experiences.Any(de => de.Id == e.Id)).ToList();
      foreach (var e in experiencesToRemove)
      {
        profile.Experiences.Remove(e);
      }

      foreach (var de in dto.Experiences)
      {
        var existing = profile.Experiences.FirstOrDefault(e => e.Id == de.Id);
        if (existing != null)
        {
          existing.CompanyName = de.CompanyName;
          existing.Role = de.Role;
          existing.StartDate = de.StartDate;
          existing.EndDate = de.EndDate;
          existing.Description = de.Description;
          existing.LogoUrl = de.LogoUrl;
          existing.Location = de.Location;
        }
        else
        {
          profile.Experiences.Add(new Experience
          {
            Id = de.Id == Guid.Empty ? Guid.NewGuid() : de.Id,
            ProfileId = profile.Id,
            CompanyName = de.CompanyName,
            Role = de.Role,
            StartDate = de.StartDate,
            EndDate = de.EndDate,
            Description = de.Description,
            LogoUrl = de.LogoUrl,
            Location = de.Location
          });
        }
      }
    }

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
    Email = p.Email,
    Phone = p.Phone,
    ExperienceJson = p.ExperienceJson,
    EducationJson = p.EducationJson,
    Skills = p.Skills,
    SocialLinks = p.SocialLinks,
    PhotoUrl = p.PhotoUrl,
    ShowPhoto = p.ShowPhoto,
    CreatedAt = p.CreatedAt,
    Projects = p.Projects?.Select(pr => new ProjectDto
    {
      Id = pr.Id,
      ProfileId = pr.ProfileId,
      Title = pr.ProjectTitle,
      Description = pr.Description,
      TechologiesUsed = pr.TechologiesUsed,
      Links = pr.Links,
      RepositoryUrl = pr.RepositoryUrl
    }).ToList() ?? [],
    Educations = p.Educations?.Select(ed => new EducationDto
    {
      Id = ed.Id,
      ProfileId = ed.ProfileId,
      SchoolName = ed.SchoolName,
      Degree = ed.Degree,
      FieldOfStudy = ed.FieldOfStudy,
      StartDate = ed.StartDate,
      EndDate = ed.EndDate,
      GPA = ed.GPA
    }).ToList() ?? [],
    Experiences = p.Experiences?.Select(ex => new ExperienceDto
    {
      Id = ex.Id,
      ProfileId = ex.ProfileId,
      CompanyName = ex.CompanyName,
      Role = ex.Role,
      StartDate = ex.StartDate,
      EndDate = ex.EndDate,
      Description = ex.Description,
      LogoUrl = ex.LogoUrl,
      Location = ex.Location
    }).ToList() ?? []
  };
}
