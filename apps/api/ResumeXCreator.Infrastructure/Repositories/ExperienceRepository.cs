using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Infrastructure.Data;

namespace ResumeXCreator.Infrastructure.Repositories;

public class ExperienceRepository(AppDbContext context) : GenericRepository<Experience>(context), IExperienceRepository
{
  public async Task<IEnumerable<Experience>> GetByUserIdAsync(string userId)
  {
    return await _context.Experiences
        .Where(e => e.UserId == userId)
        .ToListAsync();
  }
}
