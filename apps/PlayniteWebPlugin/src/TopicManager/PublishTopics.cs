using System;

namespace PlayniteWeb.Services.Mqtt
{
  public static class PublishTopics
  {
    public static string Connection() => "connection";
    public static string LibraryRequesteCompleted() => "library/request/state";
    public static string Game(Guid id) => GameEntity("games", id);
    public static string GameFile (Guid id, string assetId) => GameEntityAsset("games", id, assetId);
    public static string Platform(Guid id) => GameEntity("platforms", id);
    public static string PlatformFile(Guid id, string assetId) => GameEntityAsset("platforms", id, assetId);
    public static string GameEntity(string name, Guid id) => $"entity/{name}/{id}";
    public static string GameEntityAsset(string name, Guid id, string assetId) => $"entity/{name.ToCamelCase()}/{id}/asset/{assetId}";
  }
}
