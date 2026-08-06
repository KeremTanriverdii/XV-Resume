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
      AiProfileInput profile,
      string? jobDescriptionText = null)
  {
    if (string.IsNullOrWhiteSpace(_apiKey))
    {
      throw new InvalidOperationException("DeepSeek API key is not configured.");
    }

    var jobDescription = !string.IsNullOrWhiteSpace(jobDescriptionText)
        ? jobDescriptionText
        : await ScrapeJobDescriptionAsync(externalJobLink);

    var prompt = $@"
You are an expert ATS (Applicant Tracking System) parser and senior recruiter.
Analyze the candidate profile against the target job description.

JOB DESCRIPTION:
{jobDescription}

CANDIDATE PROFILE:
- Full Name: {profile.FullName}
- Title: {profile.Title}
- Summary: {profile.Summary}
- Skills: {string.Join(", ", profile.Skills)}
- Experiences: {JsonSerializer.Serialize(profile.Experiences)}
- Educations: {JsonSerializer.Serialize(profile.Educations)}
- Projects: {JsonSerializer.Serialize(profile.Projects)}

RETURN STICTLY A JSON OBJECT matching these exact properties:
- matchPercentage: INTEGER (0 to 100)
- matchedSkills: ARRAY of STRINGS
- missingSkills: ARRAY of STRINGS
- atsFeedback: STRING (actionable 3-4 sentence Markdown advice on how to improve ATS match)
- scrapedJobTitle: STRING (extracted job title from description)
";

    var payload = new
    {
      model = _model,
      messages = new[]
        {
          new { role = "system", content = "You are an expert ATS analysis tool. Respond STRICTLY in JSON format." },
          new { role = "user", content = prompt }
        },
      response_format = new { type = "json_object" },
      temperature = 0.3
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

    return new AiAtsAnalysisResult
    {
      MatchPercentage = root.GetProperty("matchPercentage").GetInt32(),
      MatchedSkills = matchedSkills,
      MissingSkills = missingSkills,
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

  private async Task<string> ScrapeJobDescriptionAsync(string url)
  {
    if (string.IsNullOrWhiteSpace(url) || !Uri.TryCreate(url, UriKind.Absolute, out _))
    {
      return "No job link provided. Generate resume targeting the applicant's title.";
    }

    try
    {
      var request = new HttpRequestMessage(HttpMethod.Get, url);
      request.Headers.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
      request.Headers.AcceptLanguage.ParseAdd("tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7");

      var response = await _httpClient.SendAsync(request);
      if (!response.IsSuccessStatusCode)
      {
        return $"[Could not retrieve job page directly: Status {response.StatusCode}. Aligning resume with industry standards for target position.]";
      }

      var html = await response.Content.ReadAsStringAsync();
      if (string.IsNullOrWhiteSpace(html))
      {
        return "[Job page returned empty content. Aligning resume with industry standards.]";
      }

      string cleanText = Regex.Replace(html, "<script[^>]*?>[\\s\\S]*?</script>", " ", RegexOptions.IgnoreCase);
      cleanText = Regex.Replace(cleanText, "<style[^>]*?>[\\s\\S]*?</style>", " ", RegexOptions.IgnoreCase);
      cleanText = Regex.Replace(cleanText, "<.*?>", " ");
      cleanText = System.Net.WebUtility.HtmlDecode(cleanText);
      cleanText = Regex.Replace(cleanText, @"[ \t]+", " ");
      cleanText = Regex.Replace(cleanText, @"\n\s*\n", "\n\n").Trim();

      return cleanText.Length > 8000 ? cleanText[..8000] : cleanText;
    }
    catch (Exception ex)
    {
      return $"[Could not retrieve job page directly: {ex.Message}. Aligning resume with industry standards for target position.]";
    }
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
