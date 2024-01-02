using System;

namespace PlayniteWeb.TopicManager
{
  public static class PublishTopics
  {
    public static string Connection() => "connection";
    public static string LibraryRequesteCompleted() => "library/request/state";
    public static string Game(Guid id) => GameEntity("game", id);
    public static string Platform(Guid id) => GameEntity("platform", id);
    public static string GameEntity(string name, Guid id) => $"entity/{name.ToLower()}/{id}";
    public static string GameEntityRemoval(string name, Guid id) => $"{GameEntity(name, id)}/removed";
} }
