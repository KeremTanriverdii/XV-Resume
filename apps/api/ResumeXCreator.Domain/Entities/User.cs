
using ResumeXCreator.Domain.Enums;

namespace ResumeXCreator.Domain.Entities
{
  public class User
  {
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<Profile> Profiles { get; set; } = [];
    public string ChoosedLanguage { get; set; } = "en";
    public string Country { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string DistrictAndCityLocation { get; set; } = string.Empty;
    public MilitaryStatus MilitaryStatus { get; set; } = MilitaryStatus.None;
    public DateTime? MilitaryPostponedUntil { get; set; }
    public string SubscriptionsStatus { get; set; } = "Trial";
    public DateTime? TrialsEndsAt { get; set; }
    public string? PaddleCustomerId { get; set; }
    public DateTime? SubscriptionEndsAt { get; set; }
    public bool CanGenerateResume => SubscriptionsStatus != "PastDue" && (
      SubscriptionsStatus == "Active"
      || (SubscriptionEndsAt.HasValue && DateTime.UtcNow <= SubscriptionEndsAt.Value)
      || (SubscriptionsStatus == "Trial" && TrialsEndsAt.HasValue && DateTime.UtcNow <= TrialsEndsAt.Value)
    );
  }
}