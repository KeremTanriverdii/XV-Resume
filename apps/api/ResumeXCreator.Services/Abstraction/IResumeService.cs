using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services.Abstraction;

public interface IResumeService
{
    Task<IEnumerable<ResumeDto>> GetAllResumesAsync(string? userId = null);
    Task<ResumeDto?> GetResumeByIdAsync(Guid id);
    Task<ResumeDto> CreateResumeAsync(CreateResumeDto createResumeDto);
    Task<ResumeDto> GenerateResumeAsync(CreateResumeDto dto, string authenticatedUserId);
    Task<bool> DeleteResumeAsync(Guid id, string authenticatedUserId);
    Task<ResumeTranslationDto?> UpdateResumeTranslationAsync(Guid resumeId, int translationId, UpdateResumeTranslationDto dto, string authenticatedUserId);
    Task<AtsAnalysisResultDto> AnalyzeAtsAsync(AtsAnalysisRequestDto dto, string authenticatedUserId);
}
