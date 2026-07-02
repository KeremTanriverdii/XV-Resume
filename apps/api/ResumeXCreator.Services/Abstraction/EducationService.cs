using ResumeXCreator.Services.DTOs;
namespace ResumeXCreator.Services.Abstraction;

public interface IEducationService
{
  Task<IEnumerable<EducationDto>> GetEducationByProfileIdAsync(Guid profileId);
  Task<EducationDto?> GetEducationByIdAsync(string userId, Guid id);
  Task<EducationDto> CreateEducationAsync(string userId, CreateEducationDto dto);
  Task<EducationDto?> UpdateEducationAsync(string userId, Guid id, CreateEducationDto dto);
  Task<bool> DeleteEducationAsync(string userId, Guid id);
  Task<IEnumerable<EducationDto>> GetEducationsByUserIdAsync(string userId);
}