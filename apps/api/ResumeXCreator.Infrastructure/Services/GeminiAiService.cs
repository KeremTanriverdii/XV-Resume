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
            matchedSkills = new { type = "ARRAY", items = new { type = "STRING" } },
            missingSkills = new { type = "ARRAY", items = new { type = "STRING" } },
            atsFeedback = new { type = "STRING" },
            coverLetter = new { type = "STRING" },
            coldMessage = new { type = "STRING" }
          },
          required = new[] { "title", "summary", "experienceHtml", "educationHtml", "skillsHtml", "languagesHtml", "projectsHtml", "matchPercentage", "matchedSkills", "missingSkills", "atsFeedback", "coverLetter", "coldMessage" }
        }
      }
    };

    HttpResponseMessage? response = null;
    int maxRetries = 3;
    int delayMs = 1000;

    for (int attempt = 1; attempt <= maxRetries; attempt++)
    {
      var requestContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
      response = await _httpClient.PostAsync(requestUrl, requestContent);

      if (response.IsSuccessStatusCode)
      {
        break;
      }

      if (((int)response.StatusCode == 429 || (int)response.StatusCode >= 500) && attempt < maxRetries)
      {
        await Task.Delay(delayMs);
        delayMs *= 2;
        continue;
      }

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
Your task is to analyze the candidate's profile and tailor their resume specifically for the target position in strictly specified language: '{languageCode}'.

==================================================
PHASE 1: TARGET JOB PERSONA & MULTI-STEP ANALYSIS
==================================================
Before generating the final JSON output, perform an implicit multi-step analysis:
1. TARGET JOB PERSONA DETERMINATION:
   - Primary Role Type (e.g., E-Commerce Operations, Software Engineering, Marketing, Finance/Analytics).
   - Target Industry (e.g., Retail/E-Commerce, Tech/SaaS, Healthcare, Finance).
   - Seniority, Functional Area, Core Business Domain, Expected Technical Skills, Expected Business Skills, and Soft Skills.
2. KEYWORD EXTRACTION & PRIORITY RANKING:
   - Extract and rank job keywords into 4 priority levels: Critical (Must-have), High, Medium, Low.
   - Prioritize Critical & High keywords in Summary, Experience, Skills, and Projects.
3. INDUSTRY ADAPTATION & WRITING STYLE:
   - Adapt tone and terminology according to the target industry domain:
     * Tech/Software: Emphasize technologies, architecture, APIs, performance, scalability.
     * Retail/E-Commerce: Emphasize operations, product catalog lifecycle, marketplaces, campaigns, reporting, sales impact.
     * Marketing/Growth: Emphasize acquisition, conversion, campaigns, user engagement metrics.
     * Finance/Analytics: Emphasize data analysis, Excel, forecasts, reporting, accuracy, compliance.
4. CANDIDATE MAPPING & RELEVANCE STRATEGY:
   - Map candidate profile against the target job persona.
   - Strongly emphasize existing work that overlaps with the target role. Downplay irrelevant tasks while maintaining 100% factual accuracy.

==================================================
TARGET JOB DETAILS
==================================================
{jobDescription}

==================================================
CANDIDATE PROFILE DATA
==================================================
- Full Name: {profile.FullName}
- Current Title: {profile.Title}
- Existing Summary: {profile.Summary}
- Email: {profile.Email}
- Phone: {profile.Phone}
- Location: {profile.Location}
- Military Status: {profile.MilitaryStatus} (Postponed until: {profile.PostponedUntil})
- Languages: {string.Join(", ", profile.Languages)}
- Portfolio / Social Links: {profile.SocialLinks}
- Skills: {string.Join(", ", profile.Skills)}
- Profile Picture URL: {profile.PhotoUrl}

Experiences:
{JsonSerializer.Serialize(profile.Experiences)}

Educations (Include GPA only if >= 3.25):
{JsonSerializer.Serialize(profile.Educations)}

Projects:
{JsonSerializer.Serialize(profile.Projects)}

==================================================
STRICT DATA INTEGRITY & HALLUCINATION GUARDS
==================================================
1. FACTUAL ACCURACY: Keep all factual information unchanged. NEVER invent fake companies, positions, dates, degrees, schools, projects, or certifications.
2. GOOGLE XYZ IMPACT FORMULA: Formulate experience achievements using the XYZ method ('Accomplished [X] measured by [Y] by doing [Z]'). If quantitative Y metrics are not present in raw candidate input, use ('Accomplished Action [X] with Business Context [Z] leading to Impact [Y]') with strong qualitative impact. Do NOT fabricate fake percentages!
3. PERSONAL DATA INTEGRITY: Preserve exact candidate contact info, names, links, and locations.
4. EMPTY SECTIONS: If candidate input has no data for a section, return an empty string for that section HTML property.

==================================================
RELEVANCE-BASED WRITING & SECTION OPTIMIZATION
==================================================
0. TARGET JOB TITLE ('title'): Generate a concise, formal target job role title strictly in '{languageCode}' (e.g., 'Kıdemli Yazılım Geliştirici' or 'Senior Software Engineer') based on the analyzed target job posting.
1. ATS-FRIENDLY SUMMARY: Write a focused 2-4 sentence summary strictly in '{languageCode}'. Synthesize: Current professional identity, Years of experience (if inferable), Domain expertise, Top matching skills, Industry keywords, and Value proposition aligned with the target role.
2. RELEVANCE-BASED EXPERIENCE REWRITING:
   - Rewrite bullet points to emphasize responsibilities that overlap with the target job persona.
   - Rebalance bullet points to highlight relevant tasks over irrelevant tasks while keeping facts 100% truthful.
   - Naturally integrate extracted Soft Skills (e.g., Analytical Thinking, Communication, Teamwork) where factually supported by background.
3. RELEVANCE-BASED SKILL GROUPING:
   - Order skill categories by relevance to target position (e.g., Business & Operations skills first for E-Commerce; Tech stack first for Software roles).
4. PROJECT RELEVANCE FILTERING (CRITICAL 3-TIER RULE):
   Evaluate candidate's projects against the target position persona:
   - Highly Relevant: Include with full impact description and tech stack.
   - Moderately Relevant: Include with concise summary.
   - Irrelevant / Unrelated: OMIT ENTIRELY from the resume (do NOT include unrelated software/tech projects in non-tech roles). If all candidate projects are irrelevant for this role, return an empty string for 'projectsHtml'.
5. HUMAN READABILITY & RECRUITER TONE: Balance ATS keyword optimization with natural human readability. Avoid keyword stuffing. Ensure the resume reads as if written by an experienced executive recruiter.

==================================================
ATS FORMATTING & HTML CONSTRAINTS
==================================================
1. ALLOWED HTML TAGS ONLY: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <a>, <br>.
2. FORBIDDEN ELEMENTS & ZERO EMOJIS/ICONS: Absolutely NO <table>, <img>, SVG markup, icons, emojis (e.g. 📧, 📞, 📍, 🪖, 💼, 🎓, 🚀, 💡), unicode symbols, text boxes, or complex nested div containers.
3. NO INLINE CSS & NO ATTRIBUTES: Do NOT use 'style' attributes, 'class' attributes, or inline CSS.
4. NO REDUNDANT SECTION HEADERS: Absolutely DO NOT write top-level section header titles (e.g., 'Teknik Yetkinlikler', 'Yetenekler', 'Skills', 'Technical Skills', 'İş Deneyimi', 'Work Experience', 'Eğitim', 'Education') at the beginning of 'skillsHtml', 'experienceHtml', 'educationHtml', etc. The CV rendering template automatically displays section headers!
5. EXPERIENCE BULLETS FORMAT (UL/LI): Format achievements strictly inside <ul> with <li> tags for bullet points. Each role header MUST be <h3><strong>Role</strong> | Company Name | StartDate - EndDate</h3> followed by <ul><li>Achievement 1...</li><li>Achievement 2...</li></ul>. NEVER write achievements as loose <p> paragraphs!
6. SKILLS FORMAT (UL/LI): Format skills strictly as a clean <ul> list with <li> bullet points for each category, e.g.: <ul><li><strong>Category Name:</strong> Skill 1, Skill 2</li><li><strong>Another Category:</strong> Skill A, Skill B</li></ul>. Do NOT use raw loose <p> lines.
7. PROPORTIONAL CONTENT & NO ARTIFICIAL GAPS: Adapt content length naturally to the candidate's actual experience level. Do NOT insert empty paragraphs (<p></p>), empty lines, or artificial spacing gaps. Maintain clean, uniform, and proportional formatting across all sections.

==================================================
DATE FORMATTING & LOCALE RULES
==================================================
1. LOCALE DATES: Translate all month names and present/current terms strictly into target language '{languageCode}'.
   - If '{languageCode}' is 'tr': format dates as 'Ocak 2022 - Günümüz' or 'Ağustos 2021 - Haziran 2023' (or '01/2022 - Günümüz').
   - If '{languageCode}' is 'en': format dates as 'January 2022 - Present' or 'August 2021 - June 2023'.
   - If '{languageCode}' is 'de': format dates as 'Januar 2022 - Heute' or 'August 2021 - Juni 2023'.
   - NEVER leave English month names ('January', 'August') or English words ('Present', 'Current') when generating content in non-English languages.
2. CONSISTENT DATE PATTERN: Use a consistent date pattern (e.g., 'Month YYYY - Month YYYY' or 'MM/YYYY - Present/Günümüz') across all work experiences and educations.

==================================================
ATS MATCH SCORE & FEEDBACK RULES
==================================================
1. ATS SCORE CALCULATION ('matchPercentage'): Calculate realistic score (0 to 100) strictly based on this weighted formula. Do NOT inflate scores:
   - 40%: Required Skills Match
   - 20%: Preferred Skills Match
   - 15%: Relevant Experience & Seniority Match
   - 10%: Education & Qualifications Match
   - 10%: Projects & Portfolio Alignment
   - 5%: Language Requirements Match
2. ATS FEEDBACK FORMAT ('atsFeedback'): Write detailed feedback strictly in '{languageCode}' formatted as clean Markdown with the following exact sections:
   ### Strengths
   ### Missing Keywords
   ### Weak Areas
   ### Improvement Suggestions
   ### Estimated ATS Risks
3. COVER LETTER ('coverLetter'): Write a complete, compelling 3-4 paragraph formal Cover Letter strictly in '{languageCode}'.
   - Address the hiring manager/employer for the target job description.
   - Connect applicant's past achievements, skills, and background directly to company requirements.
4. COLD MESSAGE ('coldMessage'): Write a high-converting, concise 2-3 paragraph Cold Outreach Message (for LinkedIn InMail or Recruiter Email) strictly in '{languageCode}'.
   - Include a catchy subject line or greeting, applicant's top 2 value propositions, and a clear call-to-action (CTA).

==================================================
OUTPUT & LANGUAGE RULES
==================================================
- ALL generated resume content, HTML headings, text, dates, and feedback MUST be strictly in language '{languageCode}'.
- Exception for language mixing: Keep original technology/framework names (e.g., React, .NET, TypeScript), company names, and product names as-is.
- Output MUST be valid, parsable JSON matching the required schema. Do NOT wrap in markdown backticks or add introductory/trailing text.";
  }

  public async Task<AiAtsAnalysisResult> AnalyzeAtsAsync(
      string externalJobLink,
      AiProfileInput? profile = null,
      string? jobDescriptionText = null,
      string languageCode = "en")
  {
    if (string.IsNullOrWhiteSpace(_apiKey))
    {
      throw new InvalidOperationException("Gemini API key is not configured.");
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
Return JSON STRICTLY matching this schema in language '{languageCode}':
- matchPercentage: INTEGER (0 to 100 based on the 3 weighted pillars above)
- matchedSkills: ARRAY of STRINGS (key skills present in both job and candidate profile)
- missingSkills: ARRAY of STRINGS (all missing skills)
- criticalMissingSkills: ARRAY of STRINGS (must-have core skills required by job but missing in candidate profile)
- recommendedMissingSkills: ARRAY of STRINGS (nice-to-have secondary skills required by job but missing in profile)
- atsFeedback: STRING (Rich Markdown ATS analysis covering: 1) Technical Match, 2) Google XYZ Formula Before/After Transformation example, 3) Seniority & Layout advice in '{languageCode}')
- scrapedJobTitle: STRING (extracted target job title)
";

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
        temperature = 0.0,
        responseMimeType = "application/json",
        responseSchema = new
        {
          type = "OBJECT",
          properties = new
          {
            matchPercentage = new { type = "INTEGER" },
            matchedSkills = new { type = "ARRAY", items = new { type = "STRING" } },
            missingSkills = new { type = "ARRAY", items = new { type = "STRING" } },
            criticalMissingSkills = new { type = "ARRAY", items = new { type = "STRING" } },
            recommendedMissingSkills = new { type = "ARRAY", items = new { type = "STRING" } },
            atsFeedback = new { type = "STRING" },
            scrapedJobTitle = new { type = "STRING" }
          },
          required = new[] { "matchPercentage", "matchedSkills", "missingSkills", "criticalMissingSkills", "recommendedMissingSkills", "atsFeedback", "scrapedJobTitle" }
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
      throw new InvalidOperationException("Gemini API key is not configured.");
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

    string extractedCompanyHint = ExtractCompanyFromJobUrlOrText(jobUrl, jobDetails);
    bool isColdMessage = outreachType.Equals("ColdMessage", StringComparison.OrdinalIgnoreCase);

    string prompt = $@"
You are an expert career strategist and executive copywriter specializing in high-converting professional communication.
Your task is to generate a powerful, personalized, and highly compelling {(isColdMessage ? "LinkedIn / Email Cold Message" : "Tailored Cover Letter")} for a candidate in specified language: '{languageCode}'.

==================================================
CANDIDATE BACKGROUND DATA
==================================================
{candidateSummaryText}

==================================================
TARGET JOB DETAILS
==================================================
{jobDetails}

{(string.IsNullOrWhiteSpace(jobUrl) ? "" : $@"
TARGET JOB URL:
{jobUrl}
")}

{(string.IsNullOrWhiteSpace(extractedCompanyHint) ? "" : $@"
DETECTED COMPANY NAME / HINT:
{extractedCompanyHint}
")}

==================================================
CRITICAL COMPANY NAME & PLACEHOLDER RULES
==================================================
1. DETECT ACTUAL COMPANY NAME: Thoroughly inspect the TARGET JOB DETAILS, JOB URL, and DETECTED COMPANY NAME for the employer/company name.
2. ABSOLUTELY NO BRACKETED PLACEHOLDERS FOR COMPANY NAME: If a company name is found or inferred anywhere (e.g. from text, url, or hint), YOU MUST REPLACE AND USE THE REAL COMPANY NAME in the text. NEVER output '[Şirket Adı]', '[Company Name]', '[Şirket İsmi]' or similar bracketed placeholders when the company name is present or inferable!
3. If no company name exists anywhere in the text or URL, write naturally (e.g. 'ekibinizde', 'şirketinizde', 'your team') rather than leaving raw brackets like '[Şirket Adı]'.

==================================================
INSTRUCTIONS & GUIDELINES
==================================================
{(isColdMessage
? @"- Format: 3 to 4 concise paragraphs ideal for a LinkedIn InMail, Connection request note, or direct email to a Recruiter/Hiring Manager.
- Tone: Professional, direct, respectful, and value-driven.
- Structure:
  1. Catchy Opening: Mention the specific role and company, and why candidate's experience is a strong match.
  2. Core Value Hook: Highlight 2-3 key accomplishments/skills relevant to the job.
  3. Call to Action: Friendly request for a 10-minute chat or coffee call.
- Maximum length: ~150 to 250 words."
: @"- Format: Formal Cover Letter / Letter of Interest.
- Tone: Professional, confident, and engaging.
- Structure:
  1. Opening paragraph stating position, specific company name, and enthusiasm.
  2. Body paragraphs demonstrating alignment between candidate achievements and job requirements.
  3. Closing paragraph expressing desire for an interview and thanking the hiring manager.")}

Respond with ONLY the final text content of the {(isColdMessage ? "Cold Message" : "Cover Letter")}. Do NOT wrap in JSON or Markdown code fences.";

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
    using var doc = JsonDocument.Parse(responseContent);
    var candidates = doc.RootElement.GetProperty("candidates");
    if (candidates.GetArrayLength() == 0)
    {
      throw new Exception("Gemini API returned no response.");
    }

    var text = candidates[0]
        .GetProperty("content")
        .GetProperty("parts")[0]
        .GetProperty("text")
        .GetString();

    return text?.Trim() ?? string.Empty;
  }

  private static string ExtractCompanyFromJobUrlOrText(string? jobUrl, string? jobText)
  {
    if (!string.IsNullOrWhiteSpace(jobUrl))
    {
      try
      {
        var uri = new Uri(jobUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase) ? jobUrl : $"https://{jobUrl}");
        var path = uri.AbsolutePath;
        var host = uri.Host.Replace("www.", "").ToLower();

        // Check Kariyer.net / LinkedIn / company paths (e.g. /is-ilani/trendyol-software-developer-12345)
        var match = System.Text.RegularExpressions.Regex.Match(path, @"/(?:at|company|is-ilani)/([a-z0-9-]+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        if (match.Success && match.Groups[1].Value.Length > 0)
        {
          var parts = match.Groups[1].Value.Split('-');
          // Filter out digits or common words
          var companyNameParts = parts.Where(p => !p.All(char.IsDigit) && p.Length > 1).Take(2);
          if (companyNameParts.Any())
          {
            return string.Join(" ", companyNameParts.Select(p => char.ToUpper(p[0]) + p.Substring(1)));
          }
        }

        // Domain name fallback if not aggregator
        var aggregators = new[] { "kariyer", "linkedin", "indeed", "glassdoor", "jooble" };
        if (!aggregators.Any(agg => host.Contains(agg)))
        {
          var hostParts = host.Split('.');
          if (hostParts.Length >= 2)
          {
            var domainName = hostParts[hostParts.Length - 2];
            if (domainName.Length > 2)
            {
              return char.ToUpper(domainName[0]) + domainName.Substring(1);
            }
          }
        }
      }
      catch { }
    }

    return string.Empty;
  }
}
