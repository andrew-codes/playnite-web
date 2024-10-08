using PlayniteWeb.Models;
using System;

namespace PlayniteWeb.Services.Publishers
{
  internal class GameStatePayload
  {
    public Game Game {get; set; }
    public string State { get; set; }
  }
}
