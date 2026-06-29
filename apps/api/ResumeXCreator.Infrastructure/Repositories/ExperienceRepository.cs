using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Infrastructure.Data;

namespace ResumeXCreator.Infrastructure.Repositories;

public class ExperienceRepository : GenericRepository<Experience>, IExperienceRepository
{
  public ExperienceRepository(AppDbContext context) : base(context)
  {
  }
}
