using Microsoft.EntityFrameworkCore;
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Infrastructure.Data;

namespace ResumeXCreator.Infrastructure.Repositories;

public class ResumeRepository(AppDbContext context) : GenericRepository<Resume>(context), IResumeRepository
{
    public System.Threading.Tasks.Task<Resume?> GetWithTranslationsByIdAsync(Guid id)
    {
        return _context.Resumes
            .Include(r => r.Translations)
            .FirstOrDefaultAsync(r => r.Id == id);
    }
}
