using PlayniteWeb.Services;
using System;

namespace PlayniteWeb.TopicManager
{
  public static class PublishTopics
  {
    public static string Connection() => "connection";
    public static string LibraryRequestedCompleted() => "library/request/state";
    public static string GameState() => $"response/game/state";
    public static string Game(Guid id) => GameEntity("Game", id);
    public static string Release(Guid id) => GameEntity("Release", id);
    public static string Platform(Guid id) => GameEntity("Platform", id);
    public static string Playlist(Guid id) => GameEntity("Playlist", id);
    public static string GameEntity(string name, Guid id) => $"update/{name}/{id}";
    public static string LibrarySyncStarted() => "library/sync/started";
    public static string LibrarySyncCompleted() => "library/sync/completed";
  }
}
