using MQTTnet.Client;
using MQTTnet.Protocol;
using Playnite.SDK;
using Playnite.SDK.Models;
using PlayniteWeb.Models;
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
    private readonly ILogger logger = LogManager.GetLogger();
    private readonly string deviceId;

    public PublishGameEntityRemoval(IMqttClient client, IManageTopics topicBuilder, ISerializeObjects serializer, IGameDatabaseAPI gameDatabase, string deviceId)
    {
      this.client = client;
      this.serializer = serializer;
      this.gameDatabase = gameDatabase;
      this.topicBuilder = topicBuilder;
      this.deviceId = deviceId;
    }

    public IEnumerable<Task> Publish(IIdentifiable item)
    {
      if (item is Playnite.SDK.Models.Game g)
      {
        var isGameRemoved = gameDatabase.Games
            .Where(dbg => !dbg.Id.Equals(Guid.Empty))
            .All(dbg => !dbg.Name.Equals(g.Name));

        if (isGameRemoved)
        {
          using (MD5 md5 = MD5.Create())
          {
            byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(g.Name));
            var id = new Guid(hash);

            logger.Info($"Playnite Web Game {g.Name} removed; Publishing removal.");
            var gameTopic = topicBuilder.GetPublishTopic(PublishTopics.Game(id));
            yield return client.PublishStringAsync(gameTopic, serializer.Serialize(new EntityUpdatePayload<Models.Game>(EntityUpdateAction.Delete, deviceId) { Entity = new Models.Game(id) }), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default);
          }
        }

        logger.Info($"Playnite Web Release {g.Name} removed; Publishing removal.");
        var releaseTopic = topicBuilder.GetPublishTopic(PublishTopics.Release(g.Id));
        yield return client.PublishStringAsync(releaseTopic, serializer.Serialize(new EntityUpdatePayload<Release>(EntityUpdateAction.Delete, deviceId) { Entity = new Release(g, null) }), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default);

      }
    }
  }
}
