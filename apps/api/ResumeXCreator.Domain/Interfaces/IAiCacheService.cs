using System.Threading.Tasks;

namespace ResumeXCreator.Domain.Interfaces;

public interface IAiCacheService
{
  Task<string?> GetCachedResponseAsync(string cacheKey);
  Task SetCachedResponseAsync(string cacheKey, string content, System.TimeSpan ttl);
  string GenerateCacheKey(string outreachType, string sourceContent, string jobTarget, string languageCode);
}
