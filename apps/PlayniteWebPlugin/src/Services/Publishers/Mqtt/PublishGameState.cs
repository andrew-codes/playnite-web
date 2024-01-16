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
    private readonly int? processId;

    public PublishGameState(IMqttClient client, IManageTopics topicBuilder, int? processId = null)
    {
      this.client = client;
      this.topicBuilder = topicBuilder;
      this.processId = processId;
    }

    public IEnumerable<Task> Publish(IIdentifiable game)
    {
      var g = (Game)game;
      if (g.IsInstalling)
      {
        yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.GameState(g.Id, GameState.Installing)) , string.Empty);
        yield break;
      }
      if (g.IsInstalled)
      {
        yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.GameState(g.Id, GameState.Installed)), string.Empty);
        yield break;
      }
      if (g.IsLaunching)
      {
        yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.GameState(g.Id, GameState.Starting)));
        yield break;
      }
      if (g.IsRunning)
      {
        yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.GameState(g.Id, GameState.Started)), $"{processId}");
        yield break;
      }
      if (g.InstallationStatus == InstallationStatus.Uninstalled)
      {
        yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.GameState(g.Id, GameState.Uninstalled)));
        yield break;
      }
      yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.GameState(g.Id, GameState.Stopped)), $"{processId}");
    }
  }
}
