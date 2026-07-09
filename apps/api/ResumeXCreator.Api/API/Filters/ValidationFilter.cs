using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace ResumeXCreator.Api.API.Filters;

public class ValidationFilter<T> : IEndpointFilter where T : class
{
  public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
  {
    var validator = context.HttpContext.RequestServices.GetService<IValidator<T>>();
    if (validator is null)
    {
      return await next(context);
    }

    var argToValidate = context.Arguments.FirstOrDefault(x => x is T) as T;
    if (argToValidate is null)
    {
      return Results.BadRequest(new { error = $"Request body of type '{typeof(T).Name}' is missing or invalid." });
    }

    var validationResult = await validator.ValidateAsync(argToValidate);
    if (!validationResult.IsValid)
    {
      return Results.ValidationProblem(validationResult.ToDictionary());
    }

    return await next(context);
  }
}

public static class ValidationExtensions
{
  public static RouteHandlerBuilder WithValidation<T>(this RouteHandlerBuilder builder) where T : class
  {
    return builder.AddEndpointFilter<ValidationFilter<T>>();
  }
}
