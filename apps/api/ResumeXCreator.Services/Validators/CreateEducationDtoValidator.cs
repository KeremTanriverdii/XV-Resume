using System;
using FluentValidation;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services.Validators;

public class CreateEducationDtoValidator : AbstractValidator<CreateEducationDto>
{
  public CreateEducationDtoValidator()
  {
    RuleFor(x => x.SchoolName)
      .NotEmpty().WithMessage("School Name is required.")
      .MaximumLength(200).WithMessage("School Name must not exceed 200 characters.");

    RuleFor(x => x.Degree)
      .NotEmpty().WithMessage("Degree is required.")
      .MaximumLength(100).WithMessage("Degree must not exceed 100 characters.");

    RuleFor(x => x.FieldOfStudy)
      .NotEmpty().WithMessage("Field of study is required.")
      .MaximumLength(100).WithMessage("Field of study must not exceed 100 characters.");

    RuleFor(x => x.StartDate)
      .NotEmpty().WithMessage("Start Date is required.")
      .LessThanOrEqualTo(DateTime.Now).WithMessage("Start Date cannot be in the future.");

    RuleFor(x => x.EndDate)
      .GreaterThan(x => x.StartDate).WithMessage("End Date must be after Start Date.")
      .When(x => !x.IsOngoing && x.EndDate.HasValue);

    RuleFor(x => x.EndDate)
      .Null().WithMessage("End Date must be null if education is ongoing.")
      .When(x => x.IsOngoing);

    RuleFor(x => x.GPA)
      .MaximumLength(20).WithMessage("GPA must not exceed 20 characters.");
  }
}
