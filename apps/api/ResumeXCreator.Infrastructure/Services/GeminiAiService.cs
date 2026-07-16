using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using ResumeXCreator.Domain.Interfaces;

namespace ResumeXCreator.Infrastructure.Services;

public class GeminiAiService : IAiService
{
  private readonly HttpClient _httpClient;
  private readonly string _apiKey;
  private readonly string _model;

  public GeminiAiService(HttpClient httpClient, IConfiguration configuration)
  {
    _httpClient = httpClient;
    _apiKey = configuration["Gemini:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? string.Empty;
    _model = "gemini-3.1-flash-lite";
  }

  public async Task<AiGeneratedResumeResult> GenerateResumeTranslationAsync(
      string externalJobLink,
      AiProfileInput profile,
      string languageCode)
  {
    if (string.IsNullOrWhiteSpace(_apiKey))
    {
      throw new InvalidOperationException("Gemini API key is not configured. Please set 'Gemini:ApiKey' in appsettings.json or the 'GEMINI_API_KEY' environment variable.");
    }

    // 1. Scrape Job Details
    var jobDescription = await ScrapeJobDescriptionAsync(externalJobLink);

    // 2. Prepare prompt
    var prompt = BuildPrompt(jobDescription, profile, languageCode);

    // 3. Request Gemini API
    var requestUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";

    var payload = new
    {
      contents = new[]
        {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
      generationConfig = new
      {
        responseMimeType = "application/json",
        responseSchema = new
        {
          type = "OBJECT",
          properties = new
          {
            title = new { type = "STRING" },
            summary = new { type = "STRING" },
            experienceHtml = new { type = "STRING" },
            educationHtml = new { type = "STRING" },
            skillsHtml = new { type = "STRING" }
          },
          required = new[] { "title", "summary", "experienceHtml", "educationHtml", "skillsHtml" }
        }
      }
    };

    var requestContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
    var response = await _httpClient.PostAsync(requestUrl, requestContent);

    if (!response.IsSuccessStatusCode)
    {
      var errorDetails = await response.Content.ReadAsStringAsync();
      throw new Exception($"Gemini API error (Status: {response.StatusCode}): {errorDetails}");
    }

    var responseContent = await response.Content.ReadAsStringAsync();

    try
    {
      using var doc = JsonDocument.Parse(responseContent);
      var candidates = doc.RootElement.GetProperty("candidates");
      if (candidates.GetArrayLength() == 0)
      {
        throw new Exception("Gemini API returned no candidates in response.");
      }

      var text = candidates[0]
          .GetProperty("content")
          .GetProperty("parts")[0]
          .GetProperty("text")
          .GetString();

      if (string.IsNullOrWhiteSpace(text))
      {
        throw new Exception("Gemini API returned an empty text response.");
      }

      var result = JsonSerializer.Deserialize<AiGeneratedResumeResult>(text, new JsonSerializerOptions
      {
        PropertyNameCaseInsensitive = true
      });

      if (result == null)
      {
        throw new Exception("Failed to deserialize generated content to AiGeneratedResumeResult.");
      }

      return result;
    }
    catch (Exception ex)
    {
      throw new Exception($"Failed to parse Gemini response: {ex.Message}. Raw content: {responseContent}", ex);
    }
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

      var response = await _httpClient.SendAsync(request);
      if (!response.IsSuccessStatusCode)
      {
        return $"[Could not retrieve job page directly: Status {response.StatusCode}. Aligning resume with industry standards for target position.]";
      }

      var html = await response.Content.ReadAsStringAsync();

      // Remove scripts, styles and get text only
      var cleanText = Regex.Replace(html, "<script[^>]*?>[\\s\\S]*?</script>", " ");
      cleanText = Regex.Replace(html, "<style[^>]*?>[\\s\\S]*?</style>", " ");
      cleanText = Regex.Replace(cleanText, "<.*?>", " ");
      cleanText = Regex.Replace(cleanText, @"\s+", " ").Trim();

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
You are an expert ATS (Applicant Tracking System) CV Optimizer and Professional Resume Writer.Your task is to tailor the candidate's resume for the target job description or link.Generate the resume details in the language specified: '{languageCode}'.Target Job Details:
{jobDescription}

Candidate Profile Information:
- Full Name: {profile.FullName}
- Current Title: {profile.Title}
- Summary: {profile.Summary}
- Location: {profile.Location}
- Skills: {string.Join(", ", profile.Skills)}

Experiences:
{JsonSerializer.Serialize(profile.Experiences)}

Educations:
{JsonSerializer.Serialize(profile.Educations)}

Projects:
{JsonSerializer.Serialize(profile.Projects)}

Instructions for the Output Fields (Tailor them to match the target job requirements):
1. 'title': Determine the most suitable, optimized job title the candidate should target for this job.2. 'summary': Write a compelling, ATS-friendly professional summary (2-4 sentences) that highlights how the candidate's skills and experience match the job.3. 'experienceHtml': Rewrite and format the experiences as clean, professional HTML.- For each experience, output semantic HTML elements. Use standard Tailwind Typography tags:
     - Wrap each role in an <h3> with company and dates (e.g. `<h3><strong>{{Role}}</strong> at {{Company}} ({{StartDate}} - {{EndDate}})</h3>`).- Wrap descriptions and achievements in `<p>` or `<ul>` with `<li>` tags for bullet points.- Optimize the achievements to emphasize matching skills and keywords from the job description.4. 'educationHtml': Rewrite and format the education history as clean, professional HTML.- Use headings like `<h3>` for school and degree, and `<p>` for dates/GPA.5. 'skillsHtml': Rewrite and format the skills as a clean list in HTML.- Group them logically if possible, or display them as a list of bullet points or inline bold list.Requirements:
- Output MUST be valid JSON matching the specified response schema.- Do NOT wrap the JSON inside markdown code blocks (e.g. do NOT write ```json ... ```) in the text parts, as the output must be raw JSON.- The output language must be exactly '{languageCode}'.- All HTML output must be clean, semantic, and safe. Do not use ad-hoc CSS classes or inline style attributes. Standard HTML tags (h3, strong, p, ul, li, em) are styling-compatible with the frontend container.";
  }
}
