using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using ResumeXCreator.Services.Abstraction;

namespace ResumeXCreator.Services;

public static class ServiceExtensions
{
  public static IServiceCollection AddBusinessServices(this IServiceCollection services)
  {
    services.AddValidatorsFromAssembly(typeof(ServiceExtensions).Assembly);

    services.AddScoped<IResumeService, ResumeService>();
    services.AddScoped<IProfileService, ProfileService>();
    services.AddScoped<IEducationService, EducationService>();
    services.AddScoped<IExperienceService, ExperienceService>();
    services.AddScoped<IProjectService, ProjectService>();
    services.AddScoped<IUserService, UserService>();
    return services;
  }
}
