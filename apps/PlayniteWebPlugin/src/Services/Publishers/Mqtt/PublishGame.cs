using MQTTnet.Client;
using MQTTnet.Protocol;
using Playnite.SDK;
using Playnite.SDK.Models;
using PlayniteWeb.Models;
using PlayniteWeb.TopicManager;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.Mqtt
{
  internal class PublishGame : IPublishToPlayniteWeb
  {
    private readonly IMqttClient client;
    private readonly ISerializeObjects serializer;
    private readonly IGameDatabaseAPI gameDatabase;
    private readonly IPublishToPlayniteWeb publishRelease;
    private readonly IManageTopics topicBuilder;

    public PublishGame(IMqttClient client, IManageTopics topicBuilder, ISerializeObjects serializer, IGameDatabaseAPI gameDatabase, IPublishToPlayniteWeb publishRelease)
    {
      this.client = client;
      this.serializer = serializer;
      this.gameDatabase = gameDatabase;
      this.publishRelease = publishRelease;
      this.topicBuilder = topicBuilder;
    }

    public IEnumerable<Task> Publish(IIdentifiable game)
    {
      var topic = topicBuilder.GetPublishTopic(PublishTopics.Game(game.Id));
      yield return client.PublishStringAsync(topic, serializer.Serialize(game), MqttQualityOfServiceLevel.AtLeastOnce, retain: false, cancellationToken: default);

      var releasePublishes = ((Models.Game)game).Releases.SelectMany(release => publishRelease.Publish(release));
      foreach (var task in releasePublishes)
      {
        yield return task;
      }
    }
  }
}
