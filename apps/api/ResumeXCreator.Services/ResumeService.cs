using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services;

public class ResumeService : IResumeService
{
    private readonly IResumeRepository _resumeRepository;

    public ResumeService(IResumeRepository resumeRepository)
    {
        _resumeRepository = resumeRepository;
    }

    public async Task<IEnumerable<ResumeDto>> GetAllResumesAsync()
    {
        var resumes = await _resumeRepository.GetAllAsync();
        return resumes.Select(r => new ResumeDto
        {
            Id = r.Id,
            Title = r.Title,
            Content = r.Content,
            JobDescription = r.JobDescription,
            CreatedAt = r.CreatedAt
        });
    }

    public async Task<ResumeDto?> GetResumeByIdAsync(Guid id)
    {
        var resume = await _resumeRepository.GetByIdAsync(id);
        if (resume == null) return null;

        return new ResumeDto
        {
            Id = resume.Id,
            Title = resume.Title,
            Content = resume.Content,
            JobDescription = resume.JobDescription,
            CreatedAt = resume.CreatedAt
        };
    }

    public async Task<ResumeDto> CreateResumeAsync(CreateResumeDto createResumeDto)
    {
        var resume = new Resume
        {
            Id = Guid.NewGuid(),
            Title = createResumeDto.Title,
            Content = createResumeDto.Content,
            JobDescription = createResumeDto.JobDescription,
            CreatedAt = DateTime.UtcNow
        };

        await _resumeRepository.AddAsync(resume);
        await _resumeRepository.SaveChangesAsync();

        return new ResumeDto
        {
            Id = resume.Id,
            Title = resume.Title,
            Content = resume.Content,
            JobDescription = resume.JobDescription,
            CreatedAt = resume.CreatedAt
        };
    }
}
