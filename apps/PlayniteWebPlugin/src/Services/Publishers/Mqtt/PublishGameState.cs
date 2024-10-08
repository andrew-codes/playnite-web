using MQTTnet.Client;
using Playnite.SDK.Models;
using PlayniteWeb.TopicManager;
using System;
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

    public PublishGameState(GameState state, IMqttClient client, IManageTopics topicBuilder, ISerializeObjects serializer)
    {
      this.state = state;
      this.client = client;
      this.topicBuilder = topicBuilder;
      this.serializer = serializer;
      this.serializer = serializer;
    }

    public IEnumerable<Task> Publish(IIdentifiable game)
    {
      var g = (Models.Game)game;
      if (state != null)
      {
        yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.GameState()), serializer.Serialize(new GameStatePayload()
        {
          Game = g,
          State = state.ToString()
        }));
        yield break;
      }
    }
  }
}
