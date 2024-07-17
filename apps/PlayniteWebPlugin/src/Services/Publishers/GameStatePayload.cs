using System;

namespace PlayniteWeb.Services.Publishers
{
  internal class GameStatePayload
  {
    public int? ProcessId { get; set; }
    public string State { get; set; }

    public Guid Id { get; set; }
  }
}
