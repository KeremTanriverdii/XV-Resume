using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Infrastructure.Data;

namespace ResumeXCreator.Infrastructure.Repositories;

public class ResumeRepository(AppDbContext context) : GenericRepository<Resume>(context), IResumeRepository
{
    public async Task<Resume?> GetWithTranslationsByIdAsync(System.Guid id)
    {
        return await _context.Resumes
            .AsNoTracking()
            .AsSplitQuery()
            .Include(r => r.Translations)
            .Include(r => r.Profile)
                .ThenInclude(p => p!.ProfileProjects)
                    .ThenInclude(pp => pp.Project)
            .Include(r => r.Profile)
                .ThenInclude(p => p!.ProfileEducations)
                    .ThenInclude(pe => pe.Education)
            .Include(r => r.Profile)
                .ThenInclude(p => p!.ProfileExperiences)
                    .ThenInclude(pe => pe.Experience)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<IEnumerable<Resume>> GetAllWithTranslationsAsync()
    {
        return await _context.Resumes
            .AsNoTracking()
            .AsSplitQuery()
            .Include(r => r.Translations)
            .Include(r => r.Profile)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Resume>> GetByUserIdWithTranslationsAsync(string userId)
    {
        return await _context.Resumes
            .AsNoTracking()
            .AsSplitQuery()
            .Include(r => r.Translations)
            .Include(r => r.Profile)
            .Where(r => r.Profile != null && r.Profile.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Resume>> GetPagedByUserIdWithTranslationsAsync(string userId, int page, int pageSize)
    {
        return await _context.Resumes
            .AsNoTracking()
            .AsSplitQuery()
            .Include(r => r.Translations)
            .Include(r => r.Profile)
            .Where(r => r.Profile != null && r.Profile.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }
}

