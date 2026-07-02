using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Infrastructure.Data;

namespace ResumeXCreator.Infrastructure.Repositories;

public class ProjectRepository(AppDbContext context) : GenericRepository<Project>(context), IProjectRepository
{
  public async Task<IEnumerable<Project>> GetByUserIdAsync(string userId)
  {
    return await _context.Projects
        .Where(p => p.UserId == userId)
        .ToListAsync();
  }
}
