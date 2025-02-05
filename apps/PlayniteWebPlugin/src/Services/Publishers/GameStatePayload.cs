namespace PlayniteWeb.Services.Publishers
{
  internal class GameStatePayload
  {
    public int? ProcessId { get; set; }
    public string GameId {get; set; }
    public string State { get; set; }
  }
}
