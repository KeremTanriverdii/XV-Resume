using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services.Abstraction;

public interface IExperienceService
{
  Task<IEnumerable<ExperienceDto>> GetExperienceByProfileIdAsync(Guid profileId);
  Task<ExperienceDto?> GetExperienceByIdAsync(string userId, Guid id);
  Task<ExperienceDto> CreateExperienceAsync(string userId, CreateExperienceDto dto);
  Task<ExperienceDto?> UpdateExperienceAsync(string userId, Guid id, CreateExperienceDto dto);
  Task<bool> DeleteExperienceAsync(string userId, Guid id);
  Task<IEnumerable<ExperienceDto>> GetExperiencesByUserIdAsync(string userId);
  Task<IEnumerable<ExperienceDto>> GetSuggestedExperiencesAsync(Guid profileId);
}