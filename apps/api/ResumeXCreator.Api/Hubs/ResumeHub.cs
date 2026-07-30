using Microsoft.AspNetCore.SignalR;

namespace ResumeXCreator.Api.Hubs;

public interface IResumeClient
{
  Task ReceiveProgress(string resumeId, string message, int progressPercentage);
  Task ReceiveCompleted(string resumeId, string message);
  Task ReceiveError(string resumeId, string error);
}

public class ResumeHub : Hub<IResumeClient>
{
  public async Task JoinResumeGroup(string resumeId)
  {
    await Groups.AddToGroupAsync(Context.ConnectionId, $"resume_{resumeId}");
  }

  public async Task LeaveResumeGroup(string resumeId)
  {
    await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"resume_{resumeId}");
  }
}
