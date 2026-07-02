using System.Collections.Generic;
using System.Threading.Tasks;
using ResumeXCreator.Domain.Entities;

namespace ResumeXCreator.Domain.Interfaces;

public interface IEducationRepository : IGenericRepository<Education>
{
  Task<IEnumerable<Education>> GetByUserIdAsync(string userId);
}
