using MQTTnet.Client;
using Playnite.SDK;
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
    private readonly GameState? state;
    private readonly ILogger logger;

    public PublishGameState(GameState state, IMqttClient client, IManageTopics topicBuilder, ISerializeObjects serializer)
    {
      this.state = state;
      this.client = client;
      this.topicBuilder = topicBuilder;
      this.serializer = serializer;
      this.serializer = serializer;
      this.logger = LogManager.GetLogger();
    }

    public IEnumerable<Task> Publish(IIdentifiable release)
    {
      if (release is Models.Release r)
      {
        if (state == null)
        {
          logger.Warn($"GameState is null for release {r.Id} {r.ProcessId}; Skipping.");
          yield break;
        }

        yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.GameState()), serializer.Serialize(new GameStatePayload()
        {
          GameId = r.GameId,
          ProcessId = r.ProcessId,
          State = state.ToString()
        }), MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce, retain: false, cancellationToken: default);
        yield break;
      }
    }
  }
}
