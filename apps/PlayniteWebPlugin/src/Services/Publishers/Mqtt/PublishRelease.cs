using MQTTnet.Client;
using MQTTnet.Protocol;
using Playnite.SDK;
using Playnite.SDK.Models;
using PlayniteWeb.Models;
using PlayniteWeb.TopicManager;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.Mqtt
{
  internal class PublishRelease : IPublishToPlayniteWeb
  {
    private readonly IMqttClient client;
    private readonly ISerializeObjects serializer;
    private readonly IGameDatabaseAPI gameDatabase;
    private readonly IManageTopics topicBuilder;
    private string deviceId;

    public PublishRelease(IMqttClient client, IManageTopics topicBuilder, ISerializeObjects serializer, IGameDatabaseAPI gameDatabase, string deviceId)
    {
      this.client = client;
      this.serializer = serializer;
      this.gameDatabase = gameDatabase;
      this.topicBuilder = topicBuilder;
      this.deviceId = deviceId;
    }

    public IEnumerable<Task> Publish(IIdentifiable release)
    {
      if (release is Release r)
      {

        var topic = topicBuilder.GetPublishTopic(PublishTopics.Release(r.Id));

        var coverImageFilePath = new GameCoverFilePath(r).getFilePath();
        var coverPublisher = new PublishAsset(client, gameDatabase, coverImageFilePath, topic, AssetType.cover);
        foreach (var task in coverPublisher.Publish(r))
        {
          yield return task;
        }

        var backgroundImageFilePath = new GameBackgroundFilePath(r).getFilePath();
        var backgroundPublisher = new PublishAsset(client, gameDatabase, backgroundImageFilePath, topic, AssetType.background);
        foreach (var task in backgroundPublisher.Publish(r))
        {
          yield return task;
        }

        yield return client.PublishStringAsync(topic, serializer.Serialize(new EntityUpdatePayload<Models.Release>(EntityUpdateAction.Update, deviceId) { Entity = r }), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default);
      }
    }
  }
}
