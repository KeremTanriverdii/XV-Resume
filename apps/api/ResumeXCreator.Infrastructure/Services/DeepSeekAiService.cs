using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using ResumeXCreator.Domain.Interfaces;

namespace ResumeXCreator.Infrastructure.Services;

public class DeepSeekAiService : IAiService
{
  private readonly HttpClient _httpClient;
  private readonly string _apiKey;
  private readonly string _model;

  public DeepSeekAiService(HttpClient httpClient, IConfiguration configuration)
  {
    _httpClient = httpClient;
    _apiKey = configuration["DeepSeek:ApiKey"] ?? Environment.GetEnvironmentVariable("DEEPSEEK_API_KEY") ?? string.Empty;
    _model = configuration["DeepSeek:Model"] ?? "deepseek-chat";
  }

  public async Task<AiGeneratedResumeResult> GenerateResumeTranslationAsync(
      string externalJobLink,
      AiProfileInput profile,
      string languageCode)
  {
    if (string.IsNullOrWhiteSpace(_apiKey))
    {
      throw new InvalidOperationException("DeepSeek API key is not configured. Please set 'DeepSeek:ApiKey' in appsettings.json or 'DEEPSEEK_API_KEY' environment variable.");
    }

    var jobDescription = await ScrapeJobDescriptionAsync(externalJobLink);
    var prompt = BuildPrompt(jobDescription, profile, languageCode);

    var payload = new
    {
      model = _model,
      messages = new[]
        {
          new { role = "system", content = "You are an elite Applicant Tracking System (ATS) Resume Optimizer. Respond STRICTLY with valid JSON format." },
          new { role = "user", content = prompt }
        },
      response_format = new { type = "json_object" },
      temperature = 0.5
    };

    var responseContent = await PostToDeepSeekAsync(payload);

    try
    {
      using var doc = JsonDocument.Parse(responseContent);
      var choices = doc.RootElement.GetProperty("choices");
      if (choices.GetArrayLength() == 0)
      {
        throw new Exception("DeepSeek API returned no choices in response.");
      }

      var text = choices[0]
          .GetProperty("message")
          .GetProperty("content")
          .GetString();

      if (string.IsNullOrWhiteSpace(text))
      {
        throw new Exception("DeepSeek API returned an empty response.");
      }

      var result = JsonSerializer.Deserialize<AiGeneratedResumeResult>(text, new JsonSerializerOptions
      {
        PropertyNameCaseInsensitive = true
      });

      if (result == null)
      {
        throw new Exception("Failed to deserialize generated content from DeepSeek.");
      }

      return result with { ScrapedJobDescription = jobDescription };
    }
    catch (Exception ex)
    {
      throw new Exception($"Failed to parse DeepSeek response: {ex.Message}. Raw content: {responseContent}", ex);
    }
  }

  public async Task<AiAtsAnalysisResult> AnalyzeAtsAsync(
      string externalJobLink,
      AiProfileInput? profile = null,
      string? jobDescriptionText = null,
      string languageCode = "en")
  {
    if (string.IsNullOrWhiteSpace(_apiKey))
    {
      throw new InvalidOperationException("DeepSeek API key is not configured.");
    }

    var rawJobDescription = !string.IsNullOrWhiteSpace(jobDescriptionText)
        ? jobDescriptionText
        : await ScrapeJobDescriptionAsync(externalJobLink);
    var jobDescription = Regex.Replace(rawJobDescription ?? string.Empty, @"[\x00-\x08\x0B\x0C\x0E-\x1F]", " ");

    var candidateDataStr = profile != null
        ? $@"- Full Name: {profile.FullName}
- Title: {profile.Title}
- Summary: {profile.Summary}
- Skills: {string.Join(", ", profile.Skills)}
- Experiences: {JsonSerializer.Serialize(profile.Experiences)}
- Educations: {JsonSerializer.Serialize(profile.Educations)}
- Projects: {JsonSerializer.Serialize(profile.Projects)}"
        : "Candidate structured profile not selected. Extract candidate profile details directly from candidate attached CV in Target Job Description field above.";

    var prompt = $@"
You are an expert ATS (Applicant Tracking System) parser and senior recruiter.
Analyze the candidate profile against the target job description using professional 3-pillar ATS evaluation rules.
IMPORTANT: Respond strictly in specified language: '{languageCode}'.

==================================================
TARGET JOB DESCRIPTION & ATTACHED CANDIDATE CV
==================================================
{jobDescription}

==================================================
CANDIDATE PROFILE DATA
==================================================
{candidateDataStr}

==================================================
ATS SCORING WEIGHTS & EVALUATION MODEL
==================================================
Calculate the final `matchPercentage` (INTEGER 0 to 100) using a weighted combination of 3 core pillars:

1. KEYWORD & TECHNICAL SKILLS MATCH (50% - 60% Weight):
   - Direct match of core technical skills, frameworks, tools, and job terminology in Job Description vs Profile.
   - Do NOT penalize candidate excessively if core requirements match and only minor nice-to-have skills are missing.

2. FORMAT, STRUCTURE & GOOGLE XYZ FORMULA (20% - 30% Weight):
   - Machine readability and clean section layout (Summary, Experience, Education, Skills).
   - Evaluation of experience bullet points against Google's XYZ Formula ('Accomplished [X] measured by [Y] by doing [Z]').

3. EXPERIENCE & EDUCATION FIT (10% - 20% Weight):
   - Candidate seniority, role relevance, degree field, and background alignment.

==================================================
DEDUPLICATION & EXACT MATCHING RULES
==================================================
1. STRICT SKILL MATCHING: Compare Job Description requirements against Candidate Profile Skills, Summary, Experiences, and Projects.
2. SYNONYM & CASE INSENSITIVITY: Treat equivalent terms as identical (e.g., React / ReactJS, .NET / C# / .NET Core, Postgres / PostgreSQL, Amazon Web Services / AWS).
3. NEVER CONFLICT: If a skill (or its synonym) is present anywhere in the Candidate Profile, it MUST be included in `matchedSkills`. It MUST NEVER be listed in `missingSkills`, `criticalMissingSkills`, or `recommendedMissingSkills`.
4. DETERMINISTIC EVALUATION: Calculate `matchPercentage` consistently and objectively based purely on factual matches.

==================================================
OUTPUT SCHEMA & INSTRUCTIONS
==================================================
RETURN STRICTLY A JSON OBJECT matching these exact properties in language '{languageCode}':
- matchPercentage: INTEGER (0 to 100 based on the 3 weighted pillars above)
- matchedSkills: ARRAY of STRINGS (key skills present in both job and candidate profile)
- missingSkills: ARRAY of STRINGS (all missing skills)
- criticalMissingSkills: ARRAY of STRINGS (must-have core skills required by job but missing in candidate profile)
- recommendedMissingSkills: ARRAY of STRINGS (nice-to-have secondary skills required by job but missing in profile)
- atsFeedback: STRING (Rich Markdown ATS analysis covering: 1) Technical Match, 2) Google XYZ Formula Before/After Transformation example, 3) Seniority & Layout advice in '{languageCode}')
- scrapedJobTitle: STRING (extracted target job title)
";

    var payload = new
    {
      model = _model,
      messages = new[]
        {
          new { role = "system", content = $"You are an expert ATS analysis tool. Respond STRICTLY in JSON format in language: '{languageCode}'." },
          new { role = "user", content = prompt }
        },
      response_format = new { type = "json_object" },
      temperature = 0.0
    };

    var responseContent = await PostToDeepSeekAsync(payload);

    using var doc = JsonDocument.Parse(responseContent);
    var choices = doc.RootElement.GetProperty("choices");
    if (choices.GetArrayLength() == 0)
    {
      throw new Exception("DeepSeek API returned no choices.");
    }

    var text = choices[0]
        .GetProperty("message")
        .GetProperty("content")
        .GetString();

    using var resultDoc = JsonDocument.Parse(text!);
    var root = resultDoc.RootElement;

    var matchedSkills = new List<string>();
    if (root.TryGetProperty("matchedSkills", out var matchedArr))
    {
      foreach (var item in matchedArr.EnumerateArray())
        matchedSkills.Add(item.GetString() ?? "");
    }

    var missingSkills = new List<string>();
    if (root.TryGetProperty("missingSkills", out var missingArr))
    {
      foreach (var item in missingArr.EnumerateArray())
        missingSkills.Add(item.GetString() ?? "");
    }

    var criticalMissingSkills = new List<string>();
    if (root.TryGetProperty("criticalMissingSkills", out var critArr))
    {
      foreach (var item in critArr.EnumerateArray())
        criticalMissingSkills.Add(item.GetString() ?? "");
    }

    var recommendedMissingSkills = new List<string>();
    if (root.TryGetProperty("recommendedMissingSkills", out var recArr))
    {
      foreach (var item in recArr.EnumerateArray())
        recommendedMissingSkills.Add(item.GetString() ?? "");
    }

    return new AiAtsAnalysisResult
    {
      MatchPercentage = root.GetProperty("matchPercentage").GetInt32(),
      MatchedSkills = matchedSkills,
      MissingSkills = missingSkills.Count > 0 ? missingSkills : criticalMissingSkills.Concat(recommendedMissingSkills).ToList(),
      CriticalMissingSkills = criticalMissingSkills,
      RecommendedMissingSkills = recommendedMissingSkills,
      AtsFeedback = root.GetProperty("atsFeedback").GetString() ?? string.Empty,
      ScrapedJobTitle = root.TryGetProperty("scrapedJobTitle", out var titleProp) ? titleProp.GetString() ?? string.Empty : string.Empty,
      ScrapedJobDescription = jobDescription
    };
  }

  public async Task<string> GenerateOutreachTextAsync(
      string outreachType,
      string candidateSummaryText,
      string? jobUrl = null,
      string? jobDescriptionText = null,
      string languageCode = "en")
  {
    if (string.IsNullOrWhiteSpace(_apiKey))
    {
      throw new InvalidOperationException("DeepSeek API key is not configured.");
    }

    string jobDetails = jobDescriptionText ?? string.Empty;
    if (string.IsNullOrWhiteSpace(jobDetails) && !string.IsNullOrWhiteSpace(jobUrl))
    {
      jobDetails = await ScrapeJobDescriptionAsync(jobUrl);
    }
    if (string.IsNullOrWhiteSpace(jobDetails))
    {
      jobDetails = "No specific job posting provided. Write a compelling general outreach targeting top engineering / professional roles.";
    }

    bool isColdMessage = outreachType.Equals("ColdMessage", StringComparison.OrdinalIgnoreCase);

    string prompt = $@"
You are an executive copywriter specializing in high-converting professional communication.
Generate a personalized, compelling {(isColdMessage ? "LinkedIn / Email Cold Message" : "Tailored Cover Letter")} strictly in language: '{languageCode}'.

CANDIDATE BACKGROUND:
{candidateSummaryText}

TARGET JOB DETAILS:
{jobDetails}

Respond with ONLY the final plain text content of the {(isColdMessage ? "Cold Message" : "Cover Letter")}. Do NOT wrap in JSON or Markdown code fences.
";

    var payload = new
    {
      model = _model,
      messages = new[]
        {
          new { role = "user", content = prompt }
        },
      temperature = 0.7
    };

    var responseContent = await PostToDeepSeekAsync(payload);
    using var doc = JsonDocument.Parse(responseContent);
    var choices = doc.RootElement.GetProperty("choices");
    if (choices.GetArrayLength() == 0)
    {
      throw new Exception("DeepSeek API returned no response.");
    }

    var text = choices[0]
        .GetProperty("message")
        .GetProperty("content")
        .GetString();

    return text?.Trim() ?? string.Empty;
  }

  private async Task<string> PostToDeepSeekAsync(object payload)
  {
    var requestUrl = "https://api.deepseek.com/chat/completions";
    int maxRetries = 3;
    int delayMs = 1000;
    HttpResponseMessage? response = null;

    for (int attempt = 1; attempt <= maxRetries; attempt++)
    {
      var request = new HttpRequestMessage(HttpMethod.Post, requestUrl);
      request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);
      request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

      response = await _httpClient.SendAsync(request);

      if (response.IsSuccessStatusCode)
      {
        return await response.Content.ReadAsStringAsync();
      }

      if (((int)response.StatusCode == 429 || (int)response.StatusCode >= 500) && attempt < maxRetries)
      {
        await Task.Delay(delayMs);
        delayMs *= 2;
        continue;
      }

      var errorDetails = await response.Content.ReadAsStringAsync();
      throw new Exception($"DeepSeek API error (Status: {response.StatusCode}): {errorDetails}");
    }

    throw new Exception("DeepSeek API request failed after retries.");
  }

  private async Task<string> ScrapeJobDescriptionAsync(string input)
  {
    if (string.IsNullOrWhiteSpace(input)) return string.Empty;
    if (Uri.TryCreate(input, UriKind.Absolute, out var uriResult)
        && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps))
    {
      try
      {
        return await Infrastructure.Helpers.JobScraperHelper.ScrapeJobDescriptionAsync(input);
      }
      catch
      {
        return input;
      }
    }
    return input;
  }

  private string BuildPrompt(string jobDescription, AiProfileInput profile, string languageCode)
  {
    return $@"
You are an elite Applicant Tracking System (ATS) Resume Optimizer and Executive Resume Writer.
Analyze candidate profile and tailor their resume specifically for target position in strictly specified language: '{languageCode}'.

TARGET JOB DETAILS:
{jobDescription}

CANDIDATE PROFILE:
- Full Name: {profile.FullName}
- Title: {profile.Title}
- Summary: {profile.Summary}
- Email: {profile.Email}
- Phone: {profile.Phone}
- Location: {profile.Location}
- Military Status: {profile.MilitaryStatus} (Postponed until: {profile.PostponedUntil})
- Languages: {string.Join(", ", profile.Languages)}
- Portfolio / Social Links: {profile.SocialLinks}
- Skills: {string.Join(", ", profile.Skills)}

Experiences:
{JsonSerializer.Serialize(profile.Experiences)}

Educations:
{JsonSerializer.Serialize(profile.Educations)}

Projects:
{JsonSerializer.Serialize(profile.Projects)}

RETURN STRICTLY A JSON OBJECT matching these exact properties:
- title: STRING (formal target job title in '{languageCode}')
- summary: STRING (focused 2-4 sentence summary in '{languageCode}')
- experienceHtml: STRING (valid HTML with <h3><strong>Role</strong> | Company | Dates</h3> and <ul><li>bullet points</li></ul>)
- educationHtml: STRING (valid HTML with <h3> and <ul><li> bullet points)
- skillsHtml: STRING (valid HTML with <ul><li><strong>Category:</strong> Skills</li></ul>)
- languagesHtml: STRING (valid HTML)
- projectsHtml: STRING (valid HTML)
- matchPercentage: INTEGER (0 to 100)
- atsFeedback: STRING (Markdown feedback in '{languageCode}')
- coverLetter: STRING (complete cover letter in '{languageCode}')
- coldMessage: STRING (concise LinkedIn/Email cold outreach in '{languageCode}')
";
  }
}
