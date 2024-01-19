using System;

namespace PlayniteWeb.Services.Publishers
{
  internal class GameStatePayload
  {
    public int? ProcessId { get; set; }
    public GameState State { get; set; }

    public Guid GameId { get; set; }
  }
}
