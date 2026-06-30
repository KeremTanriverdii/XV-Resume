using Microsoft.Extensions.DependencyInjection;
using ResumeXCreator.Services.Abstraction;

namespace ResumeXCreator.Services;

public static class ServiceExtensions
{
  public static IServiceCollection AddBusinessServices(this IServiceCollection services)
  {
    services.AddScoped<IResumeService, ResumeService>();
    services.AddScoped<IProfileService, ProfileService>();
    return services;
  }
}
