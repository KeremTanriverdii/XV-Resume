using System;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using ResumeXCreator.Domain.Interfaces;
using ResumeXCreator.Infrastructure.Data;
using ResumeXCreator.Services.Abstraction;
using ResumeXCreator.Services.DTOs;

namespace ResumeXCreator.Api.API.Endpoints;

public static class OutreachEndpoints
{
  public static void MapOutreachEndpoints(this IEndpointRouteBuilder app)
  {
    var group = app.MapGroup("/api/v1/outreach").RequireAuthorization();

    // POST /api/v1/outreach/generate
    group.MapPost("/generate", async (
        AiOutreachRequestDto dto,
        IAiService aiService,
        IAiCacheService cacheService,
        IResumeService resumeService,
        IProfileRepository profileRepo,
        AppDbContext dbContext,
        HttpContext ctx) =>
    {
      var userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? ctx.User.FindFirstValue("sub");

      if (string.IsNullOrEmpty(userId))
        return Results.Unauthorized();

      var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
      if (user != null && !user.CanGenerateResume)
      {
        return Results.Json(new { error = "SubscriptionRequired", message = "Active Pro subscription is required to generate Cover Letter & Cold Message." }, statusCode: 402);
      }

      if (string.IsNullOrWhiteSpace(dto.OutreachType))
        dto.OutreachType = "CoverLetter";

      string candidateSummaryText = string.Empty;

      // 1. Resolve Candidate Context based on 3 Data Source Options
      if (dto.SourceType.Equals("Upload", StringComparison.OrdinalIgnoreCase))
      {
        if (string.IsNullOrWhiteSpace(dto.UploadedCvText))
        {
          return Results.BadRequest(new { error = "Uploaded CV text is required when SourceType is 'Upload'." });
        }
        candidateSummaryText = dto.UploadedCvText;
      }
      else if (dto.SourceType.Equals("Resume", StringComparison.OrdinalIgnoreCase))
      {
        if (!dto.SourceId.HasValue)
        {
          return Results.BadRequest(new { error = "Resume ID is required when SourceType is 'Resume'." });
        }
        var resume = await resumeService.GetResumeByIdAsync(dto.SourceId.Value);
        if (resume == null) return Results.NotFound(new { error = "Selected Resume not found." });

        var translation = resume.Translations?.FirstOrDefault(t => t.LanguageCode.Equals(dto.LanguageCode, StringComparison.OrdinalIgnoreCase))
                       ?? resume.Translations?.FirstOrDefault();

        candidateSummaryText = $@"
Title: {translation?.Title ?? resume.Profile?.Title ?? "Applicant"}
Language: {translation?.LanguageCode ?? "en"}
Summary: {translation?.Summary}
Experience: {translation?.ExperienceHtml}
Education: {translation?.EducationHtml}
Skills: {translation?.SkillsHtml}
Projects: {translation?.ProjectsHtml}";
      }
      else // "Profile"
      {
        if (!dto.SourceId.HasValue)
        {
          return Results.BadRequest(new { error = "Profile ID is required when SourceType is 'Profile'." });
        }
        var profile = await profileRepo.GetByIdAsync(dto.SourceId.Value);
        if (profile == null) return Results.NotFound(new { error = "Selected Profile not found." });

        candidateSummaryText = $@"
Full Name: {profile.FullName}
Title: {profile.Title}
Summary: {profile.Summary}
Email: {profile.Email}
Location: {profile.Location}
Languages: {string.Join(", ", profile.Languages)}
Skills: {string.Join(", ", profile.Skills)}";
      }

      string jobTarget = !string.IsNullOrWhiteSpace(dto.JobDescription)
          ? dto.JobDescription
          : (dto.JobUrl ?? string.Empty);

      // 2. Check Cost-Reducing SHA-256 Cache
      var cacheKey = cacheService.GenerateCacheKey(dto.OutreachType, candidateSummaryText, jobTarget, dto.LanguageCode);
      var cachedResult = await cacheService.GetCachedResponseAsync(cacheKey);

      if (!string.IsNullOrWhiteSpace(cachedResult))
      {
        return Results.Ok(new AiOutreachResponseDto
        {
          GeneratedText = cachedResult,
          IsCached = true
        });
      }

      // 3. Generate via Gemini AI
      try
      {
        var generatedText = await aiService.GenerateOutreachTextAsync(
            dto.OutreachType,
            candidateSummaryText,
            dto.JobUrl,
            dto.JobDescription,
            dto.LanguageCode);

        // Store in cache for 7 days TTL
        await cacheService.SetCachedResponseAsync(cacheKey, generatedText, TimeSpan.FromDays(7));

        return Results.Ok(new AiOutreachResponseDto
        {
          GeneratedText = generatedText,
          IsCached = false
        });
      }
      catch (Exception ex)
      {
        return Results.Problem(detail: ex.Message, statusCode: 500);
      }
    })
    .RequireRateLimiting("outreach-generation")
    .WithName("GenerateOutreach");
  }
}
