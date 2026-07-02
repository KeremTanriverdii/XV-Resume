using System.Collections.Generic;
using System.Threading.Tasks;
using ResumeXCreator.Domain.Entities;

namespace ResumeXCreator.Domain.Interfaces;

public interface IProjectRepository : IGenericRepository<Project>
{
  Task<IEnumerable<Project>> GetByUserIdAsync(string userId);
}
