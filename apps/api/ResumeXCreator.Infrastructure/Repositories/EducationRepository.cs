using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Infrastructure.Data;

namespace ResumeXCreator.Infrastructure.Repositories;

public class EducationRepository : GenericRepository<Education>, IEducationRepository
{
  public EducationRepository(AppDbContext context) : base(context)
  {
  }
}
