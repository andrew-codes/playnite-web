using System;

namespace PlayniteWeb.Services.Mqtt
{
  public static class PublishTopics
  {
    public static string Connection() => "connection";
    public static string LibraryRequesteCompleted() => "library/request/state";
    public static string Game(Guid id) => $"game/{id}";
    public static string GameFile (Guid id, string assetId) => $"game/{id}/asset/{assetId}";
    public static string Platform(Guid id) => $"platform/{id}";
    public static string PlatformFile(Guid id, string assetId) => $"platform/{id}/asset/{assetId}";
  }
}
