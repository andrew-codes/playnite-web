using System;

namespace PlayniteWebMqtt.Services.Subscribers.Models
{
  internal class StartReleasePayload
  {
    public StartReleasePayloadGame Game { get; set; }
  }

  public class StartReleasePayloadGame
  {
    public string Id { get; set; }
    public int? ProcessId { get; set; }
    public StartReleasePayloadPlatform Platform { get; set; }
  }

  public class StartReleasePayloadPlatform
  {
    public string Id { get; set; }
  }
}
