using System.Collections.Generic;
using System.Threading.Tasks;
using ResumeXCreator.Domain.Entities;

namespace ResumeXCreator.Domain.Interfaces;

public interface IResumeRepository : IGenericRepository<Resume>
{
    Task<Resume?> GetWithTranslationsByIdAsync(System.Guid id);
    Task<IEnumerable<Resume>> GetAllWithTranslationsAsync();
    Task<IEnumerable<Resume>> GetByUserIdWithTranslationsAsync(string userId);
}

