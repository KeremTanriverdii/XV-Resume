using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services;

public class ProjectService(
    IProjectRepository projectRepository,
    IProfileRepository profileRepository) : IProjectService
{
  private readonly IProjectRepository _projectRepository = projectRepository;
  private readonly IProfileRepository _profileRepository = profileRepository;

  public async Task<IEnumerable<ProjectDto>> GetProjectsByUserIdAsync(string userId)
  {
    var projects = await _projectRepository.GetByUserIdAsync(userId);
    return projects.Select(p => MapToDto(p));
  }

  public async Task<ProjectDto?> GetProjectByIdAsync(string userId, Guid id)
  {
    var project = await _projectRepository.GetByIdAsync(id);
    if (project == null || project.UserId != userId) return null;
    return MapToDto(project);
  }

  public async Task<ProjectDto> CreateProjectAsync(string userId, CreateProjectDto dto)
  {
    var project = new Project
    {
      Id = Guid.NewGuid(),
      UserId = userId,
      ProjectTitle = dto.Title,
      Description = dto.Description,
      TechologiesUsed = dto.TechologiesUsed,
      Links = dto.Links,
      RepositoryUrl = dto.RepositoryUrl
    };

    await _projectRepository.AddAsync(project);
    await _projectRepository.SaveChangesAsync();

    // Link to profile if ProfileId is provided
    if (dto.ProfileId.HasValue && dto.ProfileId.Value != Guid.Empty)
    {
      var profile = await _profileRepository.GetWithDetailsByIdAsync(dto.ProfileId.Value);
      if (profile != null && profile.UserId == userId)
      {
        profile.ProfileProjects.Add(new ProfileProject
        {
          ProfileId = profile.Id,
          ProjectId = project.Id,
          SortOrder = profile.ProfileProjects.Count
        });
        await _profileRepository.SaveChangesAsync();
      }
    }

    return MapToDto(project, dto.ProfileId);
  }

  public async Task<ProjectDto?> UpdateProjectAsync(string userId, Guid id, CreateProjectDto dto)
  {
    var project = await _projectRepository.GetByIdAsync(id);
    if (project == null || project.UserId != userId) return null;

    project.ProjectTitle = dto.Title;
    project.Description = dto.Description;
    project.TechologiesUsed = dto.TechologiesUsed;
    project.Links = dto.Links;
    project.RepositoryUrl = dto.RepositoryUrl;

    _projectRepository.Update(project);
    await _projectRepository.SaveChangesAsync();

    return MapToDto(project, dto.ProfileId);
  }

  public async Task<bool> DeleteProjectAsync(string userId, Guid id)
  {
    var project = await _projectRepository.GetByIdAsync(id);
    if (project == null || project.UserId != userId) return false;

    _projectRepository.Delete(project);
    await _projectRepository.SaveChangesAsync();
    return true;
  }

  private static ProjectDto MapToDto(Project p, Guid? profileId = null) => new()
  {
    Id = p.Id,
    ProfileId = profileId,
    Title = p.ProjectTitle,
    Description = p.Description,
    TechologiesUsed = p.TechologiesUsed,
    Links = p.Links,
    RepositoryUrl = p.RepositoryUrl
  };
}
