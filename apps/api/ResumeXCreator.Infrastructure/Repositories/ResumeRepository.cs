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
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new Resume
            {
                Id = r.Id,
                ProfileId = r.ProfileId,
                ExternalJobLink = r.ExternalJobLink,
                JobDescription = string.Empty,
                CreatedAt = r.CreatedAt,
                Translations = r.Translations.Select(t => new ResumeTranslation
                {
                    Id = t.Id,
                    ResumeId = t.ResumeId,
                    LanguageCode = t.LanguageCode,
                    Title = t.Title,
                    Version = t.Version,
                    MatchPercentage = t.MatchPercentage,
                    Summary = string.Empty,
                    ExperienceHtml = string.Empty,
                    EducationHtml = string.Empty,
                    SkillsHtml = string.Empty,
                    LanguagesHtml = string.Empty
                }).ToList(),
                Profile = r.Profile == null ? null : new Profile
                {
                    Id = r.Profile.Id,
                    UserId = r.Profile.UserId,
                    ProfileName = r.Profile.ProfileName,
                    FullName = r.Profile.FullName,
                    Title = r.Profile.Title,
                    Email = r.Profile.Email,
                    Phone = r.Profile.Phone,
                    Location = r.Profile.Location,
                    PhotoUrl = r.Profile.PhotoUrl,
                    ShowPhoto = r.Profile.ShowPhoto,
                    SocialLinks = r.Profile.SocialLinks,
                    Languages = r.Profile.Languages,
                    MilitaryStatus = r.Profile.MilitaryStatus,
                    MilitaryPostponedUntil = r.Profile.MilitaryPostponedUntil
                }
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<Resume>> GetByUserIdWithTranslationsAsync(string userId)
    {
        return await _context.Resumes
            .AsNoTracking()
            .Where(r => r.Profile != null && r.Profile.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new Resume
            {
                Id = r.Id,
                ProfileId = r.ProfileId,
                ExternalJobLink = r.ExternalJobLink,
                JobDescription = string.Empty,
                CreatedAt = r.CreatedAt,
                Translations = r.Translations.Select(t => new ResumeTranslation
                {
                    Id = t.Id,
                    ResumeId = t.ResumeId,
                    LanguageCode = t.LanguageCode,
                    Title = t.Title,
                    Version = t.Version,
                    MatchPercentage = t.MatchPercentage,
                    Summary = string.Empty,
                    ExperienceHtml = string.Empty,
                    EducationHtml = string.Empty,
                    SkillsHtml = string.Empty,
                    LanguagesHtml = string.Empty
                }).ToList(),
                Profile = r.Profile == null ? null : new Profile
                {
                    Id = r.Profile.Id,
                    UserId = r.Profile.UserId,
                    ProfileName = r.Profile.ProfileName,
                    FullName = r.Profile.FullName,
                    Title = r.Profile.Title,
                    Email = r.Profile.Email,
                    Phone = r.Profile.Phone,
                    Location = r.Profile.Location,
                    PhotoUrl = r.Profile.PhotoUrl,
                    ShowPhoto = r.Profile.ShowPhoto,
                    SocialLinks = r.Profile.SocialLinks,
                    Languages = r.Profile.Languages,
                    MilitaryStatus = r.Profile.MilitaryStatus,
                    MilitaryPostponedUntil = r.Profile.MilitaryPostponedUntil
                }
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<Resume>> GetPagedByUserIdWithTranslationsAsync(string userId, int page, int pageSize)
    {
        return await _context.Resumes
            .AsNoTracking()
            .Where(r => r.Profile != null && r.Profile.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new Resume
            {
                Id = r.Id,
                ProfileId = r.ProfileId,
                ExternalJobLink = r.ExternalJobLink,
                JobDescription = string.Empty,
                CreatedAt = r.CreatedAt,
                Translations = r.Translations.Select(t => new ResumeTranslation
                {
                    Id = t.Id,
                    ResumeId = t.ResumeId,
                    LanguageCode = t.LanguageCode,
                    Title = t.Title,
                    Version = t.Version,
                    MatchPercentage = t.MatchPercentage,
                    Summary = string.Empty,
                    ExperienceHtml = string.Empty,
                    EducationHtml = string.Empty,
                    SkillsHtml = string.Empty,
                    LanguagesHtml = string.Empty
                }).ToList(),
                Profile = r.Profile == null ? null : new Profile
                {
                    Id = r.Profile.Id,
                    UserId = r.Profile.UserId,
                    ProfileName = r.Profile.ProfileName,
                    FullName = r.Profile.FullName,
                    Title = r.Profile.Title,
                    Email = r.Profile.Email,
                    Phone = r.Profile.Phone,
                    Location = r.Profile.Location,
                    PhotoUrl = r.Profile.PhotoUrl,
                    ShowPhoto = r.Profile.ShowPhoto,
                    SocialLinks = r.Profile.SocialLinks,
                    Languages = r.Profile.Languages,
                    MilitaryStatus = r.Profile.MilitaryStatus,
                    MilitaryPostponedUntil = r.Profile.MilitaryPostponedUntil
                }
            })
            .ToListAsync();
    }
}

