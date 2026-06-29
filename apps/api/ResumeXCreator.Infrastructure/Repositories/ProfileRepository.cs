using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Infrastructure.Data;

namespace ResumeXCreator.Infrastructure.Repositories;

public class ProfileRepository(AppDbContext context) : GenericRepository<Profile>(context), IProfileRepository
{
  public Task<Profile?> GetWithResumesByIdAsync(Guid id)
  {
    return _context.Profiles
        .Include(p => p.Resumes)
            .ThenInclude(r => r.Translations)
        .FirstOrDefaultAsync(p => p.Id == id);
  }

  public Task<Profile?> GetWithDetailsByIdAsync(Guid id)
  {
    return _context.Profiles
        .Include(p => p.Projects)
        .Include(p => p.Educations)
        .Include(p => p.Experiences)
        .FirstOrDefaultAsync(p => p.Id == id);
  }

  public async Task<IEnumerable<Profile>> GetByUserIdAsync(string userId)
  {
    return await _context.Profiles
        .Where(p => p.UserId == userId)
        .Include(p => p.Projects)
        .Include(p => p.Educations)
        .Include(p => p.Experiences)
        .ToListAsync();
  }
}
