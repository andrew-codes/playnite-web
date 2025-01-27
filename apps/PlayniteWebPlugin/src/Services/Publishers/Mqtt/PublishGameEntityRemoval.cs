using MQTTnet.Client;
using MQTTnet.Protocol;
using Playnite.SDK;
using Playnite.SDK.Models;
using PlayniteWeb.TopicManager;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
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
      if (item.GetType().Name == "Game")
      {
        var removeReleaseTopic = topicBuilder.GetPublishTopic(PublishTopics.GameEntityRemoval("Release", item.Id));
        yield return client.PublishStringAsync(removeReleaseTopic, string.Empty, MqttQualityOfServiceLevel.ExactlyOnce, retain: false, cancellationToken: default);

        var isGameRemoved = gameDatabase.Games
            .Where(g => !g.Id.Equals(Guid.Empty))
            .All(g => !g.Name.Equals(((Game)item).Name));

        if (isGameRemoved)
        {
          using (MD5 md5 = MD5.Create())
          {
            byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(((Game)item).Name));
            var id = new Guid(hash);

            var removeGameTopic = topicBuilder.GetPublishTopic(PublishTopics.GameEntityRemoval("Game", id));
            yield return client.PublishStringAsync(removeGameTopic, string.Empty, MqttQualityOfServiceLevel.ExactlyOnce, retain: false, cancellationToken: default);
          }
        }

      }
      else
      {
        var topic = topicBuilder.GetPublishTopic(PublishTopics.GameEntityRemoval(item.GetType().Name, item.Id));
        yield return client.PublishStringAsync(topic, string.Empty, MqttQualityOfServiceLevel.ExactlyOnce, retain: false, cancellationToken: default);
      }
    }
  }
}
