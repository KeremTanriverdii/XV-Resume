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
            skillsHtml = new { type = "STRING" },
            languagesHtml = new { type = "STRING" },
            projectsHtml = new { type = "STRING" },
            matchPercentage = new { type = "INTEGER" },
            atsFeedback = new { type = "STRING" }
          },
          required = new[] { "title", "summary", "experienceHtml", "educationHtml", "skillsHtml", "languagesHtml", "projectsHtml", "matchPercentage", "atsFeedback" }
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

      return result with { ScrapedJobDescription = jobDescription };
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
      var cleanText = Regex.Replace(html, "<script[^>]*?>[\\s\\S]*?</script>", " ", RegexOptions.IgnoreCase);
      cleanText = Regex.Replace(cleanText, "<style[^>]*?>[\\s\\S]*?</style>", " ", RegexOptions.IgnoreCase);
      cleanText = Regex.Replace(cleanText, @"function\s+\w+[\s\S]*?\{[\s\S]*?\}", " ");
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
You are an expert ATS (Applicant Tracking System) CV Optimizer and Professional Resume Writer. Your task is to tailor the candidate's resume for the target job description or link. Generate the resume details in the language specified: '{languageCode}'.Target Job Details:
{jobDescription}

Candidate Profile Information:
- Full Name: {profile.FullName}
- Current Title: {profile.Title}
- Summary: {profile.Summary}
- Location: {profile.Location}
- Military Status: {profile.MilitaryStatus} (Postponed until: {profile.PostponedUntil})
- Languages: {string.Join(", ", profile.Languages)}
- Portfolio / Social Links: {string.Join(", ", profile.SocialLinks)}
- Skills: {string.Join(", ", profile.Skills)}
- Profile picture url: {profile.PhotoUrl}

Experiences:
{JsonSerializer.Serialize(profile.Experiences)}

Educations:
{JsonSerializer.Serialize(profile.Educations)} if average is greater than 3.25, include it in the resume

Projects:
{JsonSerializer.Serialize(profile.Projects)}

CRITICAL CORE RULES - DATA INTEGRITY:
- You MUST preserve the candidate's actual name, email, phone, location, photo, and social links. Do NOT modify them.- You MUST preserve the EXACT names of the companies, roles/positions, dates, and locations provided in the 'Experiences' list. Do NOT change, combine, or fabricate companies.- You MUST preserve the EXACT school names, degrees, fields of study, and GPAs provided in the 'Educations' list.- You MUST preserve the candidate's exact projects, project titles, description details, and any links provided in the 'Projects' list.- STRICTLY PROHIBITED: Do NOT invent/hallucinate any fictional experiences, educations, or projects if the input sections are empty.Instructions for the Output Fields (Tailor them to match target job requirements):
1. 'title': Determine company name and target job title. Output format MUST be ""Company Name - Job Title"" (e.g. ""Google - Senior Frontend Developer"").2. 'summary': Write a compelling, ATS-friendly professional summary (2-4 sentences) strictly in '{languageCode}'.3. 'experienceHtml': Rewrite and format experiences as clean, impact-oriented HTML in '{languageCode}'.- Wrap each role header in an <h3> using pipe '|' separators (e.g. <h3><strong>Role</strong> | Company | StartDate - EndDate</h3>). NEVER write the English word 'at' between role and company.- Formulate achievements using strong action verbs (e.g. Developed, Engineered, Optimized, Streamlined, Spearheaded) and quantify business/technical impact with metrics/percentages where applicable (e.g. 'Improved UI performance by 20%', 'Engineered scalable features for 5K+ users').- Wrap achievements in <ul> with <li> tags for bullet points.4. 'educationHtml': Rewrite and format education history as clean HTML with <h3> and <p> in '{languageCode}'.5. 'skillsHtml': Categorize skills logically into clear grouped lists in HTML (e.g. <strong>Languages:</strong> C#, TypeScript<br><strong>Frontend:</strong> React, Next.js<br><strong>Backend & Cloud:</strong> .NET 8+, Supabase<br><strong>Tools:</strong> Git, N8N). Always spell 'Technologies' correctly.6. 'languagesHtml': Format languages as clean inline bold list or bullet points in '{languageCode}'.7. 'projectsHtml': Format candidate's projects as clean HTML with clickable links ('Live Demo', 'GitHub Repo') where available. Always spell 'Technologies' correctly.8. 'matchPercentage': Rate ATS compatibility match score from 0 to 100.9. 'atsFeedback': Provide detailed text feedback in clean Markdown in '{languageCode}'.Requirements:
- Output MUST be valid JSON matching specified response schema.- Do NOT wrap JSON inside markdown code blocks.- Output language for ALL content and headers must be strictly '{languageCode}'.- All HTML output must be clean, compact, semantic, and safe without ad-hoc CSS or empty line breaks.";
  }
}
