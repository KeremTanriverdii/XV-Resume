using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ResumeXCreator.Domain.Entities;
using ResumeXCreator.Infrastructure.Data;

namespace ResumeXCreator.Api.API.Endpoints;

public static class PaymentEndpoints
{
  public static void MapPaymentEndpoints(this IEndpointRouteBuilder app)
  {
    var group = app.MapGroup("/api/v1/payment");

    // 1. Get Subscription Status for Logged-in User
    group.MapGet("/status", async (ClaimsPrincipal claims, AppDbContext dbContext) =>
    {
      var userId = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value
                   ?? claims.FindFirst("sub")?.Value;

      if (string.IsNullOrEmpty(userId))
      {
        return Results.Unauthorized();
      }

      var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
      if (user == null)
      {
        user = new User
        {
          Id = userId,
          SubscriptionsStatus = "Trial",
          TrialsEndsAt = DateTime.UtcNow.AddDays(14)
        };
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();
      }
      else if (!user.TrialsEndsAt.HasValue && user.SubscriptionsStatus == "Trial")
      {
        user.TrialsEndsAt = DateTime.UtcNow.AddDays(14);
        await dbContext.SaveChangesAsync();
      }

      return Results.Ok(new
      {
        status = user.SubscriptionsStatus,
        trialsEndsAt = user.TrialsEndsAt,
        subscriptionEndsAt = user.SubscriptionEndsAt,
        canGenerateResume = user.CanGenerateResume
      });
    }).RequireAuthorization();

    // 2. Paddle Webhook Endpoint (Called directly by Paddle servers with Signature Verification)
    group.MapPost("/paddle-webhook", async (HttpContext context, AppDbContext dbContext, IConfiguration config, IWebHostEnvironment env) =>
    {
      var signatureHeader = context.Request.Headers["Paddle-Signature"].ToString();
      
      // Read RAW body as text
      context.Request.EnableBuffering();
      using var reader = new StreamReader(context.Request.Body, System.Text.Encoding.UTF8, detectEncodingFromByteOrderMarks: true, bufferSize: 1024, leaveOpen: true);
      var rawJson = await reader.ReadToEndAsync();
      context.Request.Body.Position = 0; // Reset position

      if (string.IsNullOrWhiteSpace(rawJson))
      {
        return Results.BadRequest(new { error = "Empty body" });
      }

      // Verify HMAC SHA256 signature
      var secret = config["Paddle:WebhookSecret"] ?? "";
      if (!VerifyPaddleSignature(signatureHeader, rawJson, secret, env.IsDevelopment()))
      {
        return Results.Unauthorized();
      }

      try
      {
        using var doc = JsonDocument.Parse(rawJson);
        var root = doc.RootElement;

        var eventType = root.TryGetProperty("event_type", out var etProp) ? etProp.GetString() : string.Empty;
        var data = root.TryGetProperty("data", out var dProp) ? dProp : default;

        string? userId = null;
        string? customerId = null;
        string? status = null;

        if (data.ValueKind != JsonValueKind.Undefined)
        {
          if (data.TryGetProperty("custom_data", out var cdProp) && cdProp.ValueKind == JsonValueKind.Object)
          {
            if (cdProp.TryGetProperty("userId", out var uidProp)) userId = uidProp.GetString();
            else if (cdProp.TryGetProperty("user_id", out var uidProp2)) userId = uidProp2.GetString();
          }

          if (data.TryGetProperty("customer_id", out var cidProp))
          {
            customerId = cidProp.GetString();
          }

          if (data.TryGetProperty("status", out var stProp))
          {
            status = stProp.GetString();
          }
        }

        DateTime? billingPeriodEndsAt = null;
        if (data.ValueKind != JsonValueKind.Undefined && data.TryGetProperty("current_billing_period", out var cbpProp) && cbpProp.ValueKind == JsonValueKind.Object)
        {
          if (cbpProp.TryGetProperty("ends_at", out var endsAtProp) && DateTime.TryParse(endsAtProp.GetString(), out var parsedEndsAt))
          {
            billingPeriodEndsAt = parsedEndsAt;
          }
        }

        if (eventType == "subscription.created" || eventType == "subscription.updated" || eventType == "transaction.completed" || eventType == "subscription.canceled" || eventType == "subscription.past_due")
        {
          User? user = null;
          if (!string.IsNullOrEmpty(userId))
          {
            user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
          }
          if (user == null && !string.IsNullOrEmpty(customerId))
          {
            user = await dbContext.Users.FirstOrDefaultAsync(u => u.PaddleCustomerId == customerId);
          }

          if (user != null)
          {
            if (!string.IsNullOrEmpty(customerId)) user.PaddleCustomerId = customerId;

            if (status == "active" || eventType == "transaction.completed")
            {
              user.SubscriptionsStatus = "Active";
              user.SubscriptionEndsAt = billingPeriodEndsAt ?? DateTime.UtcNow.AddMonths(1);
            }
            else if (status == "canceled" || eventType == "subscription.canceled")
            {
              user.SubscriptionsStatus = "Canceled";
              if (billingPeriodEndsAt.HasValue)
              {
                user.SubscriptionEndsAt = billingPeriodEndsAt.Value;
              }
            }
            else if (status == "past_due" || eventType == "subscription.past_due")
            {
              user.SubscriptionsStatus = "PastDue";
            }

            await dbContext.SaveChangesAsync();
          }
        }

        return Results.Ok(new { received = true });
      }
      catch (Exception ex)
      {
        return Results.BadRequest(new { error = ex.Message });
      }
    }).AllowAnonymous();

    // 3. Create Paddle Customer Portal Session URL
    group.MapPost("/portal-session", async (ClaimsPrincipal claims, AppDbContext dbContext, IConfiguration config) =>
    {
      var userId = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value
                   ?? claims.FindFirst("sub")?.Value;

      if (string.IsNullOrEmpty(userId))
      {
        return Results.Unauthorized();
      }

      var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
      if (user == null || string.IsNullOrEmpty(user.PaddleCustomerId))
      {
        return Results.BadRequest(new { error = "No active subscription profile found. Please subscribe to Pro first." });
      }

      var apiKey = config["Paddle:ApiKey"];
      var isSandbox = (config["Paddle:Environment"] ?? "Sandbox").Equals("Sandbox", StringComparison.OrdinalIgnoreCase);

      if (string.IsNullOrEmpty(apiKey) || apiKey.Contains("YOUR_PADDLE_API_KEY"))
      {
        return Results.BadRequest(new { error = "Paddle API credentials are not fully configured." });
      }

      var paddleBaseUrl = isSandbox ? "https://sandbox-api.paddle.com" : "https://api.paddle.com";
      var requestUrl = $"{paddleBaseUrl}/customers/{user.PaddleCustomerId}/portal-sessions";

      try
      {
        using var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
        client.DefaultRequestHeaders.Add("Paddle-Version", "1");

        var response = await client.PostAsync(requestUrl, new StringContent("{}", System.Text.Encoding.UTF8, "application/json"));
        if (!response.IsSuccessStatusCode)
        {
          var errorContent = await response.Content.ReadAsStringAsync();
          return Results.BadRequest(new { error = "Failed to create portal session from Paddle API.", details = errorContent });
        }

        var responseJson = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(responseJson);
        var root = doc.RootElement;

        if (root.TryGetProperty("data", out var dataProp) &&
            dataProp.TryGetProperty("urls", out var urlsProp) &&
            urlsProp.TryGetProperty("general", out var generalProp))
        {
          var portalUrl = generalProp.GetString();
          return Results.Ok(new { url = portalUrl });
        }

        return Results.BadRequest(new { error = "Invalid response format received from Paddle Portal Session API." });
      }
      catch (Exception ex)
      {
        return Results.BadRequest(new { error = $"Paddle Portal Session Error: {ex.Message}" });
      }
    }).RequireAuthorization();
  }

  private static bool VerifyPaddleSignature(string signatureHeader, string rawBody, string secret, bool isDevelopment)
  {
    if (isDevelopment && (string.IsNullOrEmpty(secret) || secret.Contains("YOUR_WEBHOOK_SECRET")))
      return true; // Pass verification locally if not configured to avoid blocking user setup

    if (string.IsNullOrEmpty(signatureHeader) || string.IsNullOrEmpty(rawBody) || string.IsNullOrEmpty(secret))
      return false;

    try
    {
      var parts = signatureHeader.Split(';');
      string? ts = null;
      string? h1 = null;

      foreach (var part in parts)
      {
        var kv = part.Split('=');
        if (kv.Length == 2)
        {
          if (kv[0] == "ts") ts = kv[1];
          else if (kv[0] == "h1") h1 = kv[1];
        }
      }

      if (string.IsNullOrEmpty(ts) || string.IsNullOrEmpty(h1))
        return false;

      var payload = $"{ts}:{rawBody}";
      using var hmac = new System.Security.Cryptography.HMACSHA256(System.Text.Encoding.UTF8.GetBytes(secret));
      var hashBytes = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(payload));
      var hashHex = Convert.ToHexString(hashBytes).ToLower();

      return string.Equals(hashHex, h1, StringComparison.OrdinalIgnoreCase);
    }
    catch
    {
      return false;
    }
  }
}