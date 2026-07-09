using FluentValidation;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Services.Validators;

public class CreateProjectDtoValidator : AbstractValidator<CreateProjectDto>
{
  public CreateProjectDtoValidator()
  {
    RuleFor(x => x.Title)
      .NotEmpty().WithMessage("Project Title is required.")
      .MaximumLength(200).WithMessage("Project Title must not exceed 200 characters.");

    RuleFor(x => x.Description)
      .NotEmpty().WithMessage("Project Description is required.")
      .MaximumLength(2000).WithMessage("Project Description must not exceed 2000 characters.");

    RuleFor(x => x.TechologiesUsed)
      .MaximumLength(500).WithMessage("Technologies used must not exceed 500 characters.");

    RuleFor(x => x.Links)
      .MaximumLength(1000).WithMessage("Links must not exceed 1000 characters.");

    RuleFor(x => x.RepositoryUrl)
      .MaximumLength(500).WithMessage("Repository URL must not exceed 500 characters.");
  }
}
