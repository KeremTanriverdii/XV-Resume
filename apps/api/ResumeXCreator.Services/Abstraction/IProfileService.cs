using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services.Abstraction;

public interface IProfileService
{
  Task<IEnumerable<ProfileDto>> GetProfilesByUserIdAsync(string userId);
  Task<ProfileDto?> GetProfileByIdAsync(Guid id);
  Task<ProfileDto> CreateProfileAsync(CreateProfileDto dto);
  Task<ProfileDto?> UpdateProfileAsync(Guid id, CreateProfileDto dto);
  Task<bool> DeleteProfileAsync(Guid id);
}
