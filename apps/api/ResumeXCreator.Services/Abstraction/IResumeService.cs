using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services.Abstraction;

public interface IResumeService
{
    Task<IEnumerable<ResumeDto>> GetAllResumesAsync();
    Task<ResumeDto?> GetResumeByIdAsync(Guid id);
    Task<ResumeDto> CreateResumeAsync(CreateResumeDto createResumeDto);
}
