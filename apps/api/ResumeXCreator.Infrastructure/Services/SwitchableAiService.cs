using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ResumeXCreator.Domain.Interfaces;

namespace ResumeXCreator.Infrastructure.Services;

public class SwitchableAiService : IAiService
{
  private readonly GeminiAiService _geminiService;
  private readonly DeepSeekAiService _deepSeekService;
  private readonly IConfiguration _config;
  private readonly ILogger<SwitchableAiService> _logger;

  public SwitchableAiService(
      GeminiAiService geminiService,
      DeepSeekAiService deepSeekService,
      IConfiguration config,
      ILogger<SwitchableAiService> logger)
  {
    _geminiService = geminiService;
    _deepSeekService = deepSeekService;
    _config = config;
    _logger = logger;
  }

  private string Provider => (_config["AiSettings:Provider"] ?? "Gemini").Trim();

  public async Task<AiGeneratedResumeResult> GenerateResumeTranslationAsync(
      string externalJobLink,
      AiProfileInput profile,
      string languageCode)
  {
    var provider = Provider;

    if (provider.Equals("DeepSeek", StringComparison.OrdinalIgnoreCase))
    {
      return await _deepSeekService.GenerateResumeTranslationAsync(externalJobLink, profile, languageCode);
    }

    if (provider.Equals("Auto", StringComparison.OrdinalIgnoreCase))
    {
      try
      {
        return await _deepSeekService.GenerateResumeTranslationAsync(externalJobLink, profile, languageCode);
      }
      catch (Exception ex)
      {
        _logger.LogWarning(ex, "DeepSeek AI Service failed in Auto mode. Falling back to Gemini AI Service.");
        return await _geminiService.GenerateResumeTranslationAsync(externalJobLink, profile, languageCode);
      }
    }

    // Default to Gemini
    return await _geminiService.GenerateResumeTranslationAsync(externalJobLink, profile, languageCode);
  }

  public async Task<AiAtsAnalysisResult> AnalyzeAtsAsync(
      string externalJobLink,
      AiProfileInput? profile = null,
      string? jobDescriptionText = null,
      string languageCode = "en")
  {
    var provider = Provider;

    if (provider.Equals("DeepSeek", StringComparison.OrdinalIgnoreCase))
    {
      try
      {
        return await _deepSeekService.AnalyzeAtsAsync(externalJobLink, profile, jobDescriptionText, languageCode);
      }
      catch (Exception ex)
      {
        _logger.LogWarning(ex, "DeepSeek AI Service failed. Falling back to Gemini AI Service.");
        return await _geminiService.AnalyzeAtsAsync(externalJobLink, profile, jobDescriptionText, languageCode);
      }
    }

    if (provider.Equals("Auto", StringComparison.OrdinalIgnoreCase))
    {
      try
      {
        return await _deepSeekService.AnalyzeAtsAsync(externalJobLink, profile, jobDescriptionText, languageCode);
      }
      catch (Exception ex)
      {
        _logger.LogWarning(ex, "DeepSeek AI Service failed in Auto mode. Falling back to Gemini AI Service.");
        return await _geminiService.AnalyzeAtsAsync(externalJobLink, profile, jobDescriptionText, languageCode);
      }
    }

    try
    {
      return await _geminiService.AnalyzeAtsAsync(externalJobLink, profile, jobDescriptionText, languageCode);
    }
    catch (Exception ex)
    {
      _logger.LogWarning(ex, "Gemini AI Service failed. Trying DeepSeek fallback.");
      return await _deepSeekService.AnalyzeAtsAsync(externalJobLink, profile, jobDescriptionText, languageCode);
    }
  }

  public async Task<string> GenerateOutreachTextAsync(
      string outreachType,
      string candidateSummaryText,
      string? jobUrl = null,
      string? jobDescriptionText = null,
      string languageCode = "en")
  {
    var provider = Provider;

    if (provider.Equals("DeepSeek", StringComparison.OrdinalIgnoreCase))
    {
      return await _deepSeekService.GenerateOutreachTextAsync(outreachType, candidateSummaryText, jobUrl, jobDescriptionText, languageCode);
    }

    if (provider.Equals("Auto", StringComparison.OrdinalIgnoreCase))
    {
      try
      {
        return await _deepSeekService.GenerateOutreachTextAsync(outreachType, candidateSummaryText, jobUrl, jobDescriptionText, languageCode);
      }
      catch (Exception ex)
      {
        _logger.LogWarning(ex, "DeepSeek AI Service failed in Auto mode. Falling back to Gemini AI Service.");
        return await _geminiService.GenerateOutreachTextAsync(outreachType, candidateSummaryText, jobUrl, jobDescriptionText, languageCode);
      }
    }

    return await _geminiService.GenerateOutreachTextAsync(outreachType, candidateSummaryText, jobUrl, jobDescriptionText, languageCode);
  }
}
