using ResumeXCreator.Domain.Entities;

namespace ResumeXCreator.Domain.Interfaces;

public interface IResumeRepository : IGenericRepository<Resume>
{
    System.Threading.Tasks.Task<Resume?> GetWithTranslationsByIdAsync(System.Guid id);
}
// 
