using System;

namespace PlayniteWeb.Services.Subscribers.Models
{
  internal class StartReleasePayload
  {
    public string ReleaseId { get; set; }
    public string PlatformId { get; set; }
  }
}
