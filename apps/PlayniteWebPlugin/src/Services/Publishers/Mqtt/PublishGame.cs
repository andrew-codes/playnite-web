using MQTTnet.Client;
using MQTTnet.Protocol;
using Playnite.SDK;
using Playnite.SDK.Models;
using PlayniteWeb.TopicManager;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.Mqtt
{
  internal class PublishGame : IPublishToPlayniteWeb
  {
    private readonly IMqttClient client;
    private readonly ISerializeObjects serializer;
    private readonly IPublishToPlayniteWeb publishRelease;
    private readonly IManageTopics topicBuilder;
    private readonly ILogger logger = LogManager.GetLogger();
    private readonly string deviceId;

    public PublishGame(IMqttClient client, IManageTopics topicBuilder, ISerializeObjects serializer, IPublishToPlayniteWeb publishRelease, string deviceId)
    {
      this.client = client;
      this.serializer = serializer;
      this.publishRelease = publishRelease;
      this.topicBuilder = topicBuilder;
      this.deviceId = deviceId;
    }

    public IEnumerable<Task> Publish(IIdentifiable game)
    {
      if (game is Models.Game g)
      {
        if (!g.Releases.Any())
        {
          logger.Warn($"Game {g.Id} has no releases; Skipping.");
          yield break;
        }

        var releasePublishes = ((Models.Game)game).Releases.SelectMany(release => publishRelease.Publish(release));
        foreach (var task in releasePublishes)
        {
          yield return task;
        }

        var topic = topicBuilder.GetPublishTopic(PublishTopics.Game(g.Id));
        yield return client.PublishStringAsync(topic, serializer.Serialize(new EntityUpdatePayload<Models.Game>(EntityUpdateAction.Update, deviceId) { Entity = g}), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default);
      }
    }
  }
}
