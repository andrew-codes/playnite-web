using MQTTnet.Client;
using MQTTnet.Protocol;
using Playnite.SDK;
using Playnite.SDK.Models;
using PlayniteWeb.TopicManager;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.Mqtt
{
  internal class PublishGameEntityRemoval : IPublishToPlayniteWeb
  {
    private readonly IMqttClient client;
    private readonly ISerializeObjects serializer;
    private readonly IGameDatabaseAPI gameDatabase;
    private readonly IManageTopics topicBuilder;

    public PublishGameEntityRemoval(IMqttClient client, IManageTopics topicBuilder, ISerializeObjects serializer, IGameDatabaseAPI gameDatabase)
    {
      this.client = client;
      this.serializer = serializer;
      this.gameDatabase = gameDatabase;
      this.topicBuilder = topicBuilder;
    }

    public IEnumerable<Task> Publish(IIdentifiable item)
    {
      var topic = topicBuilder.GetPublishTopic(PublishTopics.GameEntityRemoval(item.GetType().Name, item.Id));
      yield return client.PublishStringAsync(topic, string.Empty, MqttQualityOfServiceLevel.AtLeastOnce, retain: false, cancellationToken: default);
    }
  }
}
