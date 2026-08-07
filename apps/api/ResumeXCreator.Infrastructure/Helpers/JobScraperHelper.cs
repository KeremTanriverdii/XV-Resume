using System.Text.RegularExpressions;

namespace ResumeXCreator.Infrastructure.Helpers;

public static class JobScraperHelper
{
  private static readonly HttpClient HttpClient = new()
  {
    Timeout = TimeSpan.FromSeconds(15)
  };

  public static async Task<string> ScrapeJobDescriptionAsync(string url)
  {
    if (string.IsNullOrWhiteSpace(url))
    {
      return "No valid job link or description provided. Generate resume targeting the applicant's title.";
    }

    if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
    {
      return url;
    }

    try
    {
      // 1. Special Handling for LinkedIn Job URLs
      if (uri.Host.Contains("linkedin.com", StringComparison.OrdinalIgnoreCase))
      {
        var linkedinResult = await TryScrapeLinkedInJobAsync(url);
        if (!string.IsNullOrWhiteSpace(linkedinResult) && linkedinResult.Length > 100)
        {
          return linkedinResult;
        }
      }

      // 2. General Scraper Request
      var request = new HttpRequestMessage(HttpMethod.Get, url);
      request.Headers.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
      request.Headers.AcceptLanguage.ParseAdd("tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7");

      var response = await HttpClient.SendAsync(request);
      if (!response.IsSuccessStatusCode)
      {
        return $"[Could not retrieve job page directly: Status {response.StatusCode}. Aligning resume with industry standards for target position.]";
      }

      var html = await response.Content.ReadAsStringAsync();
      if (string.IsNullOrWhiteSpace(html))
      {
        return "[Job page returned empty content. Aligning resume with industry standards.]";
      }

      return ProcessAndCleanHtml(html);
    }
    catch (Exception ex)
    {
      return $"[Could not retrieve job page directly: {ex.Message}. Aligning resume with industry standards for target position.]";
    }
  }

  private static async Task<string?> TryScrapeLinkedInJobAsync(string url)
  {
    try
    {
      // Extract numeric LinkedIn Job ID from URL (e.g. /jobs/view/4123456789 or /jobs/view/title-at-company-4123456789)
      var match = Regex.Match(url, @"/jobs/(?:view/|.*?/)?(\d+)");
      if (match.Success)
      {
        var jobId = match.Groups[1].Value;
        var guestApiUrl = $"https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{jobId}";

        var request = new HttpRequestMessage(HttpMethod.Get, guestApiUrl);
        request.Headers.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        request.Headers.AcceptLanguage.ParseAdd("tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7");

        var response = await HttpClient.SendAsync(request);
        if (response.IsSuccessStatusCode)
        {
          var guestHtml = await response.Content.ReadAsStringAsync();
          if (!string.IsNullOrWhiteSpace(guestHtml) && guestHtml.Length > 100)
          {
            var cleaned = ProcessAndCleanHtml(guestHtml);
            if (cleaned.Length > 100)
            {
              return cleaned;
            }
          }
        }
      }
    }
    catch
    {
      // Fallback to standard scraping if LinkedIn API fails
    }

    return null;
  }

  public static string ProcessAndCleanHtml(string html)
  {
    // Extract metadata first if present (og:title, meta company, title)
    string jobMetaHeader = ExtractJobMetadata(html);

    string targetHtml = html;

    // 1. Strip scripts, styles, navs, headers, footers, buttons, svgs, forms
    targetHtml = Regex.Replace(targetHtml, "<script[^>]*?>[\\s\\S]*?</script>", " ", RegexOptions.IgnoreCase);
    targetHtml = Regex.Replace(targetHtml, "<style[^>]*?>[\\s\\S]*?</style>", " ", RegexOptions.IgnoreCase);
    targetHtml = Regex.Replace(targetHtml, "<nav[^>]*?>[\\s\\S]*?</nav>", " ", RegexOptions.IgnoreCase);
    targetHtml = Regex.Replace(targetHtml, "<header[^>]*?>[\\s\\S]*?</header>", " ", RegexOptions.IgnoreCase);
    targetHtml = Regex.Replace(targetHtml, "<footer[^>]*?>[\\s\\S]*?</footer>", " ", RegexOptions.IgnoreCase);
    targetHtml = Regex.Replace(targetHtml, "<button[^>]*?>[\\s\\S]*?</button>", " ", RegexOptions.IgnoreCase);
    targetHtml = Regex.Replace(targetHtml, "<svg[^>]*?>[\\s\\S]*?</svg>", " ", RegexOptions.IgnoreCase);
    targetHtml = Regex.Replace(targetHtml, "<form[^>]*?>[\\s\\S]*?</form>", " ", RegexOptions.IgnoreCase);
    targetHtml = Regex.Replace(targetHtml, @"function\s+\w+[\s\S]*?\{[\s\S]*?\}", " ");

    // 2. Format headings and lists
    targetHtml = Regex.Replace(targetHtml, @"<h[1-6][^>]*>(.*?)</h[1-6]>", "\n\n### $1\n", RegexOptions.IgnoreCase);
    targetHtml = Regex.Replace(targetHtml, @"<(strong|b)[^>]*>(.*?)</\1>", " **$2** ", RegexOptions.IgnoreCase);
    targetHtml = Regex.Replace(targetHtml, @"<li[^>]*>", "\n• ", RegexOptions.IgnoreCase);
    targetHtml = Regex.Replace(targetHtml, @"</?(p|div|tr|br\s*/?|section|article)[^>]*>", "\n", RegexOptions.IgnoreCase);

    // 3. Strip remaining HTML tags & decode HTML entities
    string cleanText = Regex.Replace(targetHtml, "<.*?>", "");
    cleanText = System.Net.WebUtility.HtmlDecode(cleanText);

    // 4. Strip UI Boilerplate lines (LinkedIn & job site navigation noise)
    cleanText = StripBoilerplateLines(cleanText);

    // 5. Normalize whitespace
    cleanText = Regex.Replace(cleanText, @"[ \t]+", " ");
    cleanText = Regex.Replace(cleanText, @"\n\s*\n", "\n\n").Trim();

    // 6. Prepend Metadata (Company, Title, Location) if available and not already at start
    if (!string.IsNullOrWhiteSpace(jobMetaHeader) && !cleanText.StartsWith(jobMetaHeader[..Math.Min(30, jobMetaHeader.Length)]))
    {
      cleanText = $"{jobMetaHeader}\n\n{cleanText}";
    }

    // Limit max length to 12,000 chars to avoid prompt token overflow while ensuring full JD is kept
    return cleanText.Length > 12000 ? cleanText[..12000] : cleanText;
  }

  private static string ExtractJobMetadata(string html)
  {
    string? title = null;

    // og:title (e.g. "OBSS şirketi İstanbul, Türkiye konumunda .NET Full Stack Developer işe alacak | LinkedIn")
    var ogTitleMatch = Regex.Match(html, @"<meta[^>]*property=""og:title""[^>]*content=""([^""]+)""", RegexOptions.IgnoreCase);
    if (!ogTitleMatch.Success)
    {
      ogTitleMatch = Regex.Match(html, @"<title[^>]*>(.*?)</title>", RegexOptions.IgnoreCase);
    }
    if (ogTitleMatch.Success)
    {
      title = System.Net.WebUtility.HtmlDecode(ogTitleMatch.Groups[1].Value.Trim());
    }

    return !string.IsNullOrWhiteSpace(title) ? $"[TARGET JOB POSTING DETAILS: {title}]" : string.Empty;
  }

  private static string StripBoilerplateLines(string text)
  {
    var boilerplatePatterns = new[]
    {
      @"^Ana içeriğe geç$",
      @"^Aramayı genişlet$",
      @"^Bu düğme seçilen.*$",
      @"^Metni temizle$",
      @"^Oturum aç$",
      @"^Hemen katıl$",
      @"^Bu iş ilanını rapor et$",
      @"^.*doğrudan mesaj gönderin$",
      @"^.*kimi işe aldığını görün$",
      @"^Skip to main content$",
      @"^Expand search$",
      @"^Clear text$",
      @"^Sign in$",
      @"^Join now$",
      @"^Report this job$",
      @"^Easy Apply$",
      @"^Kolay Başvuru$"
    };

    var lines = text.Split('\n');
    var cleanedLines = new List<string>();

    foreach (var line in lines)
    {
      var trimmed = line.Trim();
      if (string.IsNullOrWhiteSpace(trimmed)) continue;

      bool isBoilerplate = false;
      foreach (var pattern in boilerplatePatterns)
      {
        if (Regex.IsMatch(trimmed, pattern, RegexOptions.IgnoreCase))
        {
          isBoilerplate = true;
          break;
        }
      }

      if (!isBoilerplate)
      {
        cleanedLines.Add(trimmed);
      }
    }

    return string.Join("\n", cleanedLines);
  }
}
