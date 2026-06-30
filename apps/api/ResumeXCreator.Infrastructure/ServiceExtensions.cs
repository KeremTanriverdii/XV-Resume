using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Infrastructure.Data;
using ResumeXCreator.Infrastructure.Repositories;

namespace ResumeXCreator.Infrastructure;

public static class ServiceExtensions
{
  public static IServiceCollection AddDatabaseServices(this IServiceCollection services, IConfiguration config)
  {
    services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(config.GetConnectionString("DefaultConnection")));

    services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
    services.AddScoped<IProfileRepository, ProfileRepository>();
    services.AddScoped<IResumeRepository, ResumeRepository>();
    services.AddScoped<IEducationRepository, EducationRepository>();
    services.AddScoped<IExperienceRepository, ExperienceRepository>();
    services.AddScoped<IProjectRepository, ProjectRepository>();
    services.AddScoped<IUserRepository, UserRepository>();
    return services;
  }
}
