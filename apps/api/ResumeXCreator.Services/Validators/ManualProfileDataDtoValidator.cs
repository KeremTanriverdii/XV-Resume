using FluentValidation;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services.Validators;

public class ManualProfileDataDtoValidator : AbstractValidator<ManualProfileDataDto>
{
  public ManualProfileDataDtoValidator()
  {
    RuleFor(x => x.FullName)
      .NotEmpty().WithMessage("Full Name is required.")
      .MaximumLength(100).WithMessage("Full Name must not exceed 100 characters.");

    RuleFor(x => x.Title)
      .NotEmpty().WithMessage("Title is required.")
      .MaximumLength(100).WithMessage("Title must not exceed 100 characters.");

    RuleFor(x => x.Summary)
      .MaximumLength(4000).WithMessage("Summary must not exceed 4000 characters.");

    RuleFor(x => x.Email)
      .NotEmpty().WithMessage("Email is required.")
      .EmailAddress().WithMessage("Email must be a valid email address.")
      .MaximumLength(256).WithMessage("Email must not exceed 256 characters.");

    RuleFor(x => x.Phone)
      .MaximumLength(50).WithMessage("Phone must not exceed 50 characters.");
  }
}
