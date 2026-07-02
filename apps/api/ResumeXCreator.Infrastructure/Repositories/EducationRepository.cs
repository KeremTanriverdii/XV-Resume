using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Infrastructure.Data;

namespace ResumeXCreator.Infrastructure.Repositories;

public class EducationRepository(AppDbContext context) : GenericRepository<Education>(context), IEducationRepository
{
  public async Task<IEnumerable<Education>> GetByUserIdAsync(string userId)
  {
    return await _context.Educations
        .Where(e => e.UserId == userId)
        .ToListAsync();
  }
}
