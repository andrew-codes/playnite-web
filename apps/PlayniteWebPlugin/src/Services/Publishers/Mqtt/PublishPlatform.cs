using MQTTnet.Client;
using MQTTnet.Protocol;
using Playnite.SDK;
using Playnite.SDK.Models;
using PlayniteWeb.TopicManager;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.Mqtt
{
  internal class PublishPlatform : IPublishToPlayniteWeb
  {
    private readonly IMqttClient client;
    private readonly ISerializeObjects serializer;
    private readonly IGameDatabaseAPI gameDatabase;
    private readonly string deviceId;
    private readonly IManageTopics topicBuilder;

    public PublishPlatform(IMqttClient client, IManageTopics topicBuilder, ISerializeObjects serializer, IGameDatabaseAPI gameDatabase, string deviceId)
    {
      this.client = client;
      this.serializer = serializer;
      this.gameDatabase = gameDatabase;
      this.deviceId = deviceId;
      this.topicBuilder = topicBuilder;
    }

    public IEnumerable<Task> Publish(IIdentifiable platform)
    {
      if (platform is Platform p)
      {
        var topic = topicBuilder.GetPublishTopic(PublishTopics.Platform(p.Id));

        var coverImageFilePath = new PlatformCoverFilePath(p).getFilePath();
        var coverPublisher = new PublishAsset(client, gameDatabase, coverImageFilePath, topic, AssetType.cover);
        foreach (var task in coverPublisher.Publish(p))
        {
          yield return task;
        }

        var backgroundImageFilePath = new PlatformBackgroundFilePath(p).getFilePath();
        var backgroundPublisher = new PublishAsset(client, gameDatabase, backgroundImageFilePath, topic, AssetType.background);
        foreach (var task in backgroundPublisher.Publish(p))
        {
          yield return task;
        }

        var iconFilePath = new PlatformIconFilePath(p).getFilePath();
        var iconPublisher = new PublishAsset(client, gameDatabase, iconFilePath, topic, AssetType.icon);
        foreach (var task in iconPublisher.Publish(p))
        {
          yield return task;
        }

        yield return client.PublishStringAsync(topic, serializer.Serialize(new EntityUpdatePayload<Platform>(EntityUpdateAction.Update, deviceId) { Entity = p }), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default);
      }
    }
  }
}
