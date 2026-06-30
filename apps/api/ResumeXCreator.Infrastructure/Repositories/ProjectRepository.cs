using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Infrastructure.Data;

namespace ResumeXCreator.Infrastructure.Repositories;

public class ProjectRepository : GenericRepository<Project>, IProjectRepository
{
  public ProjectRepository(AppDbContext context) : base(context)
  {

  }
}
