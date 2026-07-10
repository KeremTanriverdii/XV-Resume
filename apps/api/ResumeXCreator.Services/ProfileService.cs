using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Enums;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services;

public class ProfileService(
    IProfileRepository profileRepository,
    IExperienceRepository experienceRepository,
    IEducationRepository educationRepository,
    IProjectRepository projectRepository,
    IUserRepository userRepository
    ) : IProfileService
{
  private readonly IProfileRepository _profileRepository = profileRepository;
  private readonly IExperienceRepository _experienceRepository = experienceRepository;
  private readonly IEducationRepository _educationRepository = educationRepository;
  private readonly IProjectRepository _projectRepository = projectRepository;
  private readonly IUserRepository _userRepository = userRepository;

  public async Task<IEnumerable<ProfileDto>> GetProfilesByUserIdAsync(string userId)
  {
    var profiles = await _profileRepository.GetByUserIdAsync(userId);
    return profiles.Select(MapToDto);
  }

  public async Task<ProfileDto?> GetProfileByIdAsync(string userId, Guid id)
  {
    var profile = await _profileRepository.GetWithDetailsByIdAsync(id);
    if (profile == null || profile.UserId != userId) return null;
    return MapToDto(profile);
  }

  public async Task<ProfileDto> CreateProfileAsync(CreateProfileDto dto)
  {
    var user = !string.IsNullOrEmpty(dto.UserId) ? await _userRepository.GetByIdAsync(dto.UserId) : null;
    var profile = new Profile
    {
      Id = Guid.NewGuid(),
      UserId = dto.UserId,
      ProfileName = dto.ProfileName,
      FullName = string.IsNullOrWhiteSpace(dto.FullName) ? (user?.Name ?? string.Empty) : dto.FullName,
      Email = string.IsNullOrWhiteSpace(dto.Email) ? (user?.Email ?? string.Empty) : dto.Email,
      Phone = string.IsNullOrWhiteSpace(dto.Phone) ? (user?.Phone ?? string.Empty) : dto.Phone,
      Location = string.IsNullOrWhiteSpace(dto.Location) ? (user?.DistrictAndCityLocation ?? string.Empty) : dto.Location,
      MilitaryStatus = dto.MilitaryStatus == null && user != null
    ? user.MilitaryStatus
    : (dto.MilitaryStatus ?? MilitaryStatus.None),
      MilitaryPostponedUntil = dto.MilitaryStatus == null && user != null
    ? user.MilitaryPostponedUntil
    : dto.MilitaryPostponedUntil,

      Languages = dto.Languages ?? [],
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

    if (dto.Projects != null)
    {
      int sortOrder = 0;
      foreach (var pr in dto.Projects)
      {
        Project? project = null;
        if (pr.Id != Guid.Empty)
        {
          project = await _projectRepository.GetByIdAsync(pr.Id);
        }

        if (project == null)
        {
          project = new Project
          {
            Id = pr.Id == Guid.Empty ? Guid.NewGuid() : pr.Id,
            UserId = profile.UserId,
            ProjectTitle = pr.Title,
            Description = pr.Description,
            TechologiesUsed = pr.TechologiesUsed,
            Links = pr.Links,
            RepositoryUrl = pr.RepositoryUrl
          };
          await _projectRepository.AddAsync(project);
        }
        else
        {
          project.ProjectTitle = pr.Title;
          project.Description = pr.Description;
          project.TechologiesUsed = pr.TechologiesUsed;
          project.Links = pr.Links;
          project.RepositoryUrl = pr.RepositoryUrl;
          _projectRepository.Update(project);
        }

        profile.ProfileProjects.Add(new ProfileProject
        {
          ProfileId = profile.Id,
          ProjectId = project.Id,
          SortOrder = sortOrder++
        });
      }
    }

    if (dto.Educations != null)
    {
      int sortOrder = 0;
      foreach (var ed in dto.Educations)
      {
        Education? education = null;
        if (ed.Id != Guid.Empty)
        {
          education = await _educationRepository.GetByIdAsync(ed.Id);
        }

        if (education == null)
        {
          education = new Education
          {
            Id = ed.Id == Guid.Empty ? Guid.NewGuid() : ed.Id,
            UserId = profile.UserId,
            SchoolName = ed.SchoolName,
            Degree = ed.Degree,
            FieldOfStudy = ed.FieldOfStudy,
            StartDate = ed.StartDate,
            EndDate = ed.EndDate,
            GPA = ed.GPA
          };
          await _educationRepository.AddAsync(education);
        }
        else
        {
          education.SchoolName = ed.SchoolName;
          education.Degree = ed.Degree;
          education.FieldOfStudy = ed.FieldOfStudy;
          education.StartDate = ed.StartDate;
          education.EndDate = ed.EndDate;
          education.GPA = ed.GPA;
          _educationRepository.Update(education);
        }

        profile.ProfileEducations.Add(new ProfileEducation
        {
          ProfileId = profile.Id,
          EducationId = education.Id,
          SortOrder = sortOrder++
        });
      }
    }

    if (dto.Experiences != null)
    {
      int sortOrder = 0;
      foreach (var ex in dto.Experiences)
      {
        Experience? experience = null;
        if (ex.Id != Guid.Empty)
        {
          experience = await _experienceRepository.GetByIdAsync(ex.Id);
        }

        if (experience == null)
        {
          experience = new Experience
          {
            Id = ex.Id == Guid.Empty ? Guid.NewGuid() : ex.Id,
            UserId = profile.UserId,
            CompanyName = ex.CompanyName,
            Role = ex.Role,
            StartDate = ex.StartDate,
            EndDate = ex.EndDate,
            Description = ex.Description,
            LogoUrl = ex.LogoUrl,
            Location = ex.Location
          };
          await _experienceRepository.AddAsync(experience);
        }
        else
        {
          experience.CompanyName = ex.CompanyName;
          experience.Role = ex.Role;
          experience.StartDate = ex.StartDate;
          experience.EndDate = ex.EndDate;
          experience.Description = ex.Description;
          experience.LogoUrl = ex.LogoUrl;
          experience.Location = ex.Location;
          _experienceRepository.Update(experience);
        }

        profile.ProfileExperiences.Add(new ProfileExperience
        {
          ProfileId = profile.Id,
          ExperienceId = experience.Id,
          SortOrder = sortOrder++
        });
      }
    }

    await _profileRepository.AddAsync(profile);
    await _profileRepository.SaveChangesAsync();

    return MapToDto(profile);
  }

  public async Task<ProfileDto?> UpdateProfileAsync(string userId, Guid id, CreateProfileDto dto)
  {
    var profile = await _profileRepository.GetWithDetailsByIdAsync(id);
    if (profile == null || profile.UserId != userId) return null;

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
    profile.Location = dto.Location;
    profile.Languages = dto.Languages ?? [];
    profile.MilitaryStatus = dto.MilitaryStatus ?? MilitaryStatus.None;
    profile.MilitaryPostponedUntil = dto.MilitaryPostponedUntil;

    // --- Update Projects ---
    if (dto.Projects != null)
    {
      var linksToRemove = profile.ProfileProjects
          .Where(pp => !dto.Projects.Any(dp => dp.Id == pp.ProjectId))
          .ToList();
      foreach (var link in linksToRemove)
      {
        profile.ProfileProjects.Remove(link);
      }

      int sortOrder = 0;
      foreach (var dp in dto.Projects)
      {
        var existingLink = profile.ProfileProjects.FirstOrDefault(pp => pp.ProjectId == dp.Id);
        if (existingLink != null)
        {
          existingLink.SortOrder = sortOrder++;

          if (existingLink.Project != null)
          {
            existingLink.Project.ProjectTitle = dp.Title;
            existingLink.Project.Description = dp.Description;
            existingLink.Project.TechologiesUsed = dp.TechologiesUsed;
            existingLink.Project.Links = dp.Links;
            existingLink.Project.RepositoryUrl = dp.RepositoryUrl;
          }
        }
        else
        {
          Project? project = null;
          if (dp.Id != Guid.Empty)
          {
            project = await _projectRepository.GetByIdAsync(dp.Id);
          }

          if (project == null)
          {
            project = new Project
            {
              Id = dp.Id == Guid.Empty ? Guid.NewGuid() : dp.Id,
              UserId = profile.UserId,
              ProjectTitle = dp.Title,
              Description = dp.Description,
              TechologiesUsed = dp.TechologiesUsed,
              Links = dp.Links,
              RepositoryUrl = dp.RepositoryUrl
            };
            await _projectRepository.AddAsync(project);
          }
          else
          {
            project.ProjectTitle = dp.Title;
            project.Description = dp.Description;
            project.TechologiesUsed = dp.TechologiesUsed;
            project.Links = dp.Links;
            project.RepositoryUrl = dp.RepositoryUrl;
            _projectRepository.Update(project);
          }

          profile.ProfileProjects.Add(new ProfileProject
          {
            ProfileId = profile.Id,
            ProjectId = project.Id,
            SortOrder = sortOrder++
          });
        }
      }
    }

    // --- Update Educations ---
    if (dto.Educations != null)
    {
      var linksToRemove = profile.ProfileEducations
          .Where(pe => !dto.Educations.Any(de => de.Id == pe.EducationId))
          .ToList();
      foreach (var link in linksToRemove)
      {
        profile.ProfileEducations.Remove(link);
      }

      int sortOrder = 0;
      foreach (var de in dto.Educations)
      {
        var existingLink = profile.ProfileEducations.FirstOrDefault(pe => pe.EducationId == de.Id);
        if (existingLink != null)
        {
          existingLink.SortOrder = sortOrder++;

          if (existingLink.Education != null)
          {
            existingLink.Education.SchoolName = de.SchoolName;
            existingLink.Education.Degree = de.Degree;
            existingLink.Education.FieldOfStudy = de.FieldOfStudy;
            existingLink.Education.StartDate = de.StartDate;
            existingLink.Education.EndDate = de.EndDate;
            existingLink.Education.GPA = de.GPA;
          }
        }
        else
        {
          Education? education = null;
          if (de.Id != Guid.Empty)
          {
            education = await _educationRepository.GetByIdAsync(de.Id);
          }

          if (education == null)
          {
            education = new Education
            {
              Id = de.Id == Guid.Empty ? Guid.NewGuid() : de.Id,
              UserId = profile.UserId,
              SchoolName = de.SchoolName,
              Degree = de.Degree,
              FieldOfStudy = de.FieldOfStudy,
              StartDate = de.StartDate,
              EndDate = de.EndDate,
              GPA = de.GPA
            };
            await _educationRepository.AddAsync(education);
          }
          else
          {
            education.SchoolName = de.SchoolName;
            education.Degree = de.Degree;
            education.FieldOfStudy = de.FieldOfStudy;
            education.StartDate = de.StartDate;
            education.EndDate = de.EndDate;
            education.GPA = de.GPA;
            _educationRepository.Update(education);
          }

          profile.ProfileEducations.Add(new ProfileEducation
          {
            ProfileId = profile.Id,
            EducationId = education.Id,
            SortOrder = sortOrder++
          });
        }
      }
    }

    // --- Update Experiences ---
    if (dto.Experiences != null)
    {
      var linksToRemove = profile.ProfileExperiences
          .Where(pe => !dto.Experiences.Any(de => de.Id == pe.ExperienceId))
          .ToList();
      foreach (var link in linksToRemove)
      {
        profile.ProfileExperiences.Remove(link);
      }

      int sortOrder = 0;
      foreach (var de in dto.Experiences)
      {
        var existingLink = profile.ProfileExperiences.FirstOrDefault(pe => pe.ExperienceId == de.Id);
        if (existingLink != null)
        {
          existingLink.SortOrder = sortOrder++;

          if (existingLink.Experience != null)
          {
            existingLink.Experience.CompanyName = de.CompanyName;
            existingLink.Experience.Role = de.Role;
            existingLink.Experience.StartDate = de.StartDate;
            existingLink.Experience.EndDate = de.EndDate;
            existingLink.Experience.Description = de.Description;
            existingLink.Experience.LogoUrl = de.LogoUrl;
            existingLink.Experience.Location = de.Location;
          }
        }
        else
        {
          Experience? experience = null;
          if (de.Id != Guid.Empty)
          {
            experience = await _experienceRepository.GetByIdAsync(de.Id);
          }

          if (experience == null)
          {
            experience = new Experience
            {
              Id = de.Id == Guid.Empty ? Guid.NewGuid() : de.Id,
              UserId = profile.UserId,
              CompanyName = de.CompanyName,
              Role = de.Role,
              StartDate = de.StartDate,
              EndDate = de.EndDate,
              Description = de.Description,
              LogoUrl = de.LogoUrl,
              Location = de.Location
            };
            await _experienceRepository.AddAsync(experience);
          }
          else
          {
            experience.CompanyName = de.CompanyName;
            experience.Role = de.Role;
            experience.StartDate = de.StartDate;
            experience.EndDate = de.EndDate;
            experience.Description = de.Description;
            experience.LogoUrl = de.LogoUrl;
            experience.Location = de.Location;
            _experienceRepository.Update(experience);
          }

          profile.ProfileExperiences.Add(new ProfileExperience
          {
            ProfileId = profile.Id,
            ExperienceId = experience.Id,
            SortOrder = sortOrder++
          });
        }
      }
    }

    _profileRepository.Update(profile);
    await _profileRepository.SaveChangesAsync();

    return MapToDto(profile);
  }

  public async Task<bool> DeleteProfileAsync(string userId, Guid id)
  {
    var profile = await _profileRepository.GetByIdAsync(id);
    if (profile == null || profile.UserId != userId) return false;

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
