using FluentValidation;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services.Validators;

public class UserUpdateDtoValidator : AbstractValidator<UserUpdateDto>
{
  public UserUpdateDtoValidator()
  {
    RuleFor(x => x.ChoosedLanguage)
      .NotEmpty().WithMessage("Chosen Language is required.")
      .MaximumLength(50).WithMessage("Chosen Language must not exceed 50 characters.");

    RuleFor(x => x.Fullname)
      .NotEmpty().WithMessage("Fullname is required.")
      .MaximumLength(200).WithMessage("Fullname must not exceed 200 characters.");

    RuleFor(x => x.Phone)
      .MaximumLength(50).WithMessage("Phone must not exceed 50 characters.");

    RuleFor(x => x.DistrictAndCityLocation)
      .MaximumLength(200).WithMessage("District and city location must not exceed 200 characters.");

    RuleFor(x => x.PostponedTitle)
      .MaximumLength(100).WithMessage("Postponed title must not exceed 100 characters.");
  }
}
