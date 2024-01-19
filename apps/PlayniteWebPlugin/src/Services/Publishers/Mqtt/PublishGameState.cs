using MQTTnet.Client;
using Playnite.SDK.Models;
using PlayniteWeb.TopicManager;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.Mqtt
{
  internal class PublishGameState : IPublishToPlayniteWeb
  {
    private readonly IMqttClient client;
    private readonly IManageTopics topicBuilder;
    private readonly ISerializeObjects serializer;
    private readonly int? processId;

    public PublishGameState(IMqttClient client, IManageTopics topicBuilder, ISerializeObjects serializer, int? processId = null)
    {
      this.client = client;
      this.topicBuilder = topicBuilder;
      this.serializer = serializer;
      this.processId = processId;
      this.serializer = serializer;
    }

    public IEnumerable<Task> Publish(IIdentifiable game)
    {
      var g = (Game)game;
      if (g.IsInstalling)
      {
        yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.GameState()), serializer.Serialize(new GameStatePayload()
        {
          GameId = game.Id,
          State = GameState.installing,
          ProcessId = processId
        }));
        yield break;
      }
      if (g.IsLaunching)
      {
        yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.GameState()), serializer.Serialize(new GameStatePayload()
        {
          GameId = game.Id,
          State = GameState.starting,
          ProcessId = processId
        }));
        yield break;
      }
      if (g.IsRunning)
      {
        yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.GameState()), serializer.Serialize(new GameStatePayload()
        {
          GameId = game.Id,
          State = GameState.started,
          ProcessId = processId
        }));
        yield break;
      }
      if (g.IsInstalled)
      {
        yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.GameState()), serializer.Serialize(new GameStatePayload()
        {
          GameId = game.Id,
          State = GameState.installed,
          ProcessId = processId
        }));
        yield break;
      }
      if (g.InstallationStatus == InstallationStatus.Uninstalled)
      {
        yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.GameState()), serializer.Serialize(new GameStatePayload()
        {
          GameId = game.Id,
          State = GameState.uninstalled,
          ProcessId = processId
        }));
        yield break;
      }

      yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.GameState()), serializer.Serialize(new GameStatePayload()
        {
          GameId = game.Id,
          State = GameState.stopped,
          ProcessId = processId
        }));
    }
  }
}
