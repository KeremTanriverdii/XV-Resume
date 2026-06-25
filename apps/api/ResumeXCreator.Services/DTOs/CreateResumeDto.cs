using System;
using System.Collections.Generic;

namespace ResumeXCreator.Services.DTOs;

public class CreateResumeDto
{
  public Guid? ProfileId { get; set; }
  public string JobDescription { get; set; } = string.Empty;
  public List<string> SelectedLanguagesForGeneration { get; set; } = [];
}
