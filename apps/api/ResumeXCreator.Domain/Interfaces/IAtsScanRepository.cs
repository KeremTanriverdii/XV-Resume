using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ResumeXCreator.Domain.Entities;

namespace ResumeXCreator.Domain.Interfaces;

public interface IAtsScanRepository : IGenericRepository<AtsScan>
{
  Task<AtsScan?> GetByIdWithProfileAsync(Guid id);
  Task<IEnumerable<AtsScan>> GetPagedByUserIdAsync(string userId, int page, int pageSize);
}
