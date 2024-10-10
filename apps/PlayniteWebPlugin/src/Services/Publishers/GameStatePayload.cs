using PlayniteWeb.Models;
using System;

namespace PlayniteWeb.Services.Publishers
{
  internal class GameStatePayload
  {
    public Release Release {get; set; }
    public string State { get; set; }
  }
}
