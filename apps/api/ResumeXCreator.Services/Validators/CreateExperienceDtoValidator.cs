using System;
using FluentValidation;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services.Validators;

public class CreateExperienceDtoValidator : AbstractValidator<CreateExperienceDto>
{
  public CreateExperienceDtoValidator()
  {
    RuleFor(x => x.CompanyName)
      .NotEmpty().WithMessage("Company Name is required.")
      .MaximumLength(200).WithMessage("Company Name must not exceed 200 characters.");

    RuleFor(x => x.Role)
      .NotEmpty().WithMessage("Role is required.")
      .MaximumLength(100).WithMessage("Role must not exceed 100 characters.");

    RuleFor(x => x.StartDate)
      .NotEmpty().WithMessage("Start Date is required.")
      .LessThanOrEqualTo(DateTime.Now).WithMessage("Start Date cannot be in the future.");

    RuleFor(x => x.EndDate)
      .GreaterThan(x => x.StartDate).WithMessage("End Date must be after Start Date.")
      .When(x => !x.IsOngoing && x.EndDate.HasValue);

    RuleFor(x => x.EndDate)
      .Null().WithMessage("End Date must be null if the experience is ongoing.")
      .When(x => x.IsOngoing);

    RuleFor(x => x.Description)
      .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters.");
  }
}
