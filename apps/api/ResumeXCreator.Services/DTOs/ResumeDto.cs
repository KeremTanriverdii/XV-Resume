using System;

namespace ResumeXCreator.Services.DTOs;

public class ResumeDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string JobDescription { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
