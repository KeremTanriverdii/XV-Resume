using System;
using System.Collections.Generic;

namespace ResumeXCreator.Services.DTOs;

/// <summary>
/// CV Generation request DTO.
/// ExternalJobLink is required. One of the following 3 profile sources must be used:
///   A) ProfileId → Select an existing profile
///   B) NewProfile → Create and save a new profile
///   C) ManualProfileData → Enter manual information once (not saved)
/// </summary>
public class CreateResumeDto
{
  // ── Job (required) ──
  public string ExternalJobLink { get; set; } = string.Empty;

  // ── Profile Source (3 options) ──
  public Guid? ProfileId { get; set; }                          // A: Existing profile
  public CreateProfileDto? NewProfile { get; set; }              // B: Create new profile
  public ManualProfileDataDto? ManualProfileData { get; set; }   // C: One-time

  // ── Options ──
  public List<string> SelectedLanguagesForGeneration { get; set; } = [];

  // ── Version/Session Management ──
  public Guid? ResumeId { get; set; }                           // To add a new version to an existing CV session/chat
}
