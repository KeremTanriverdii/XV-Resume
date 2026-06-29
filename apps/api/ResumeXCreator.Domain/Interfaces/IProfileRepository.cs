using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ResumeXCreator.Domain.Entities;

namespace ResumeXCreator.Domain.Interfaces;

public interface IProfileRepository : IGenericRepository<Profile>
{
  Task<Profile?> GetWithResumesByIdAsync(Guid id);
  Task<Profile?> GetWithDetailsByIdAsync(Guid id);
  Task<IEnumerable<Profile>> GetByUserIdAsync(string userId);
}
