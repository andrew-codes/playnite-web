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
    private readonly IManageTopics topicBuilder;

    public PublishPlatform(IMqttClient client, IManageTopics topicBuilder, ISerializeObjects serializer, IGameDatabaseAPI gameDatabase)
    {
      this.client = client;
      this.serializer = serializer;
      this.gameDatabase = gameDatabase;
      this.topicBuilder = topicBuilder;
    }

    public IEnumerable<Task> Publish(IIdentifiable platform)
    {
      var topic = topicBuilder.GetPublishTopic(PublishTopics.Platform(platform.Id));
      yield return client.PublishStringAsync(topic, serializer.Serialize(platform), MqttQualityOfServiceLevel.ExactlyOnce, retain: false, cancellationToken: default);

      var coverImageFilePath = new PlatformCoverFilePath(platform).getFilePath();
      var coverPublisher = new PublishAsset(client, gameDatabase, coverImageFilePath, topic, AssetType.cover);
      foreach (var task in coverPublisher.Publish(platform))
      {
        yield return task;
      }

      var backgroundImageFilePath = new PlatformBackgroundFilePath(platform).getFilePath();
      var backgroundPublisher = new PublishAsset(client, gameDatabase, backgroundImageFilePath, topic, AssetType.background);
      foreach (var task in backgroundPublisher.Publish(platform))
      {
        yield return task;
      }

      var iconFilePath = new PlatformIconFilePath(platform).getFilePath();
      var iconPublisher = new PublishAsset(client, gameDatabase, iconFilePath, topic, AssetType.icon);
      foreach (var task in iconPublisher.Publish(platform))
      {
        yield return task;
      }
    }
  }
}
