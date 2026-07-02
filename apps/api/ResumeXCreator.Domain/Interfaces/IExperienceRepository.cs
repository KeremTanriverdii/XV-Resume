using ResumeXCreator.Domain.Entities;

namespace ResumeXCreator.Domain.Interfaces;

public interface IExperienceRepository : IGenericRepository<Experience>
{
  Task<IEnumerable<Experience>> GetByUserIdAsync(string userId);
}
