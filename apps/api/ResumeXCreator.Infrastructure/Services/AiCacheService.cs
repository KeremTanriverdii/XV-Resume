using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using ResumeXCreator.Domain.Interfaces;

namespace ResumeXCreator.Infrastructure.Services;

public class AiCacheService : IAiCacheService
{
  private readonly IDistributedCache _cache;

  public AiCacheService(IDistributedCache cache)
  {
    _cache = cache;
  }

  public async Task<string?> GetCachedResponseAsync(string cacheKey)
  {
    if (string.IsNullOrWhiteSpace(cacheKey)) return null;
    return await _cache.GetStringAsync(cacheKey);
  }

  public async Task SetCachedResponseAsync(string cacheKey, string content, TimeSpan ttl)
  {
    if (string.IsNullOrWhiteSpace(cacheKey) || string.IsNullOrWhiteSpace(content)) return;

    var options = new DistributedCacheEntryOptions
    {
      AbsoluteExpirationRelativeToNow = ttl
    };

    await _cache.SetStringAsync(cacheKey, content, options);
  }

  public string GenerateCacheKey(string outreachType, string sourceContent, string jobTarget, string languageCode)
  {
    var rawString = $"{outreachType.ToLowerInvariant()}:{sourceContent.Trim()}:{jobTarget.Trim()}:{languageCode.ToLowerInvariant()}";
    using var sha256 = SHA256.Create();
    var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawString));
    var hashHex = Convert.ToHexString(hashBytes);
    return $"ai_outreach:{hashHex}";
  }
}
