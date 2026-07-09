using System;
using FluentValidation;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services.Validators;

public class CreateResumeDtoValidator : AbstractValidator<CreateResumeDto>
{
  public CreateResumeDtoValidator()
  {
    RuleFor(x => x.ExternalJobLink)
      .NotEmpty().WithMessage("External Job Link is required.")
      .Must(LinkIsValidUri).WithMessage("External Job Link must be a valid absolute URI (http or https).");

    RuleFor(x => x)
      .Must(x => (x.ProfileId.HasValue ? 1 : 0) + (x.NewProfile != null ? 1 : 0) + (x.ManualProfileData != null ? 1 : 0) == 1)
      .WithMessage("Exactly one of ProfileId, NewProfile, or ManualProfileData must be specified.");

    RuleFor(x => x.NewProfile!)
      .SetValidator(new CreateProfileDtoValidator())
      .When(x => x.NewProfile != null);

    RuleFor(x => x.ManualProfileData!)
      .SetValidator(new ManualProfileDataDtoValidator())
      .When(x => x.ManualProfileData != null);
  }

  private bool LinkIsValidUri(string link)
  {
    if (string.IsNullOrWhiteSpace(link)) return false;
    return Uri.TryCreate(link, UriKind.Absolute, out var uriResult)
           && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
  }
}
