using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services.Abstraction;

public interface IProjectService
{
  Task<IEnumerable<ProjectDto>> GetProjectsByUserIdAsync(string userId);
  Task<ProjectDto?> GetProjectByIdAsync(string userId, Guid id);
  Task<ProjectDto> CreateProjectAsync(string userId, CreateProjectDto dto);
  Task<ProjectDto?> UpdateProjectAsync(string userId, Guid id, CreateProjectDto dto);
  Task<bool> DeleteProjectAsync(string userId, Guid id);
}
