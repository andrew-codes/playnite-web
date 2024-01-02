using MQTTnet.Client;
using MQTTnet.Protocol;
using Playnite.SDK;
using Playnite.SDK.Models;
using PlayniteWeb.TopicManager;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.Mqtt
{
  internal class PublishGame : IPublishToPlaynite
  {
    private readonly IMqttClient client;
    private readonly ISerializeObjects serializer;
    private readonly IGameDatabaseAPI gameDatabase;
    private readonly IManageTopics topicBuilder;

    public PublishGame(IMqttClient client, IManageTopics topicBuilder, ISerializeObjects serializer, IGameDatabaseAPI gameDatabase)
    {
      this.client = client;
      this.serializer = serializer;
      this.gameDatabase = gameDatabase;
      this.topicBuilder = topicBuilder;
    }

    public IEnumerable<Task> Publish(IIdentifiable game)
    {
      var topic = topicBuilder.GetPublishTopic(PublishTopics.Game(game.Id));
      yield return client.PublishStringAsync(topic, serializer.Serialize(game), MqttQualityOfServiceLevel.AtLeastOnce, retain: false, cancellationToken: default);

      var coverImageFilePath = new GameCoverFilePath(game).getFilePath();
      var coverPublisher = new PublishAsset(client, gameDatabase, coverImageFilePath, topic);
      foreach (var task in coverPublisher.Publish(game))
      {
        yield return task;
      }

      var backgroundImageFilePath = new GameCoverFilePath(game).getFilePath();
      var backgroundPublisher = new PublishAsset(client, gameDatabase, backgroundImageFilePath, topic);
      foreach (var task in backgroundPublisher.Publish(game))
      {
        yield return task;
      }
    }
  }
}
