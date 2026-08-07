using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Infrastructure.Data;

namespace ResumeXCreator.Infrastructure.Repositories;

public class AtsScanRepository(AppDbContext context) : GenericRepository<AtsScan>(context), IAtsScanRepository
{
  public async Task<AtsScan?> GetByIdWithProfileAsync(Guid id)
  {
    return await _context.AtsScans
        .Include(s => s.Profile)
        .FirstOrDefaultAsync(s => s.Id == id);
  }

  public async Task<IEnumerable<AtsScan>> GetPagedByUserIdAsync(string userId, int page, int pageSize)
  {
    return await _context.AtsScans
        .AsNoTracking()
        .Where(s => s.UserId == userId)
        .OrderByDescending(s => s.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(s => new AtsScan
        {
          Id = s.Id,
          UserId = s.UserId,
          ProfileId = s.ProfileId,
          JobTitle = s.JobTitle,
          ExternalJobLink = s.ExternalJobLink,
          JobDescription = string.Empty,
          MatchPercentage = s.MatchPercentage,
          AtsFeedback = string.Empty,
          CreatedAt = s.CreatedAt,
          Profile = s.Profile == null ? null : new Profile
          {
            Id = s.Profile.Id,
            ProfileName = s.Profile.ProfileName,
            FullName = s.Profile.FullName
          }
        })
        .ToListAsync();
  }
}
