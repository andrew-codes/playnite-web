using MQTTnet.Client;
using MQTTnet.Protocol;
using Playnite.SDK;
using Playnite.SDK.Models;
using PlayniteWeb.TopicManager;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.Mqtt
{
  internal class PublishGameEntity : IPublishToPlayniteWeb
  {
    private readonly IMqttClient client;
    private readonly ISerializeObjects serializer;
    private readonly string deviceId;
    private readonly IManageTopics topicBuilder;

    public PublishGameEntity(IMqttClient client, IManageTopics topicBuilder, ISerializeObjects serializer, string deviceId)
    {
      this.client = client;
      this.serializer = serializer;
      this.deviceId = deviceId;
      this.topicBuilder = topicBuilder;
    }

    public IEnumerable<Task> Publish(IIdentifiable item)
    {
      var topic = topicBuilder.GetPublishTopic(PublishTopics.GameEntity(item.GetType().Name, item.Id));

      if (item is GameFeature feature)
      {
        yield return client.PublishStringAsync(topic, serializer.Serialize(new EntityUpdatePayload<GameFeature>(EntityUpdateAction.Update, deviceId) { Entity = feature }), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default);
      }
      else if (item is Tag tag)
      {
        yield return client.PublishStringAsync(topic, serializer.Serialize(new EntityUpdatePayload<Tag>(EntityUpdateAction.Update, deviceId) { Entity = tag }), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default);
      }
      else if (item is GameSource gameSource)
      {
        yield return client.PublishStringAsync(topic, serializer.Serialize(new EntityUpdatePayload<GameSource>(EntityUpdateAction.Update, deviceId) { Entity = gameSource }), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default);
      }
      else if (item is Genre gameGenre)
      {
        yield return client.PublishStringAsync(topic, serializer.Serialize(new EntityUpdatePayload<Genre>(EntityUpdateAction.Update, deviceId) { Entity = gameGenre }), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default);
      }
      else if (item is Category gameCategory)
      {
        yield return client.PublishStringAsync(topic, serializer.Serialize(new EntityUpdatePayload<Category>(EntityUpdateAction.Update, deviceId) { Entity = gameCategory }), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default);
      }
      else if (item is CompletionStatus completionStatus)
      {
        yield return client.PublishStringAsync(topic, serializer.Serialize(new EntityUpdatePayload<CompletionStatus>(EntityUpdateAction.Update, deviceId) { Entity = completionStatus }), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default);
      }
      else if (item is Company company)
      {
        yield return client.PublishStringAsync(topic, serializer.Serialize(new EntityUpdatePayload<Company>(EntityUpdateAction.Update, deviceId) { Entity = company }), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default);
      }
      else if (item is Emulator emulator)
      {
        yield return client.PublishStringAsync(topic, serializer.Serialize(new EntityUpdatePayload<Emulator>(EntityUpdateAction.Update, deviceId) { Entity = emulator }), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default);
      }
      else if (item is AgeRating ageRating)
      {
        yield return client.PublishStringAsync(topic, serializer.Serialize(new EntityUpdatePayload<AgeRating>(EntityUpdateAction.Update, deviceId) { Entity = ageRating }), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default);
      }
      else if (item is Region region)
      {
        yield return client.PublishStringAsync(topic, serializer.Serialize(new EntityUpdatePayload<Region>(EntityUpdateAction.Update, deviceId) { Entity = region }), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default);
      }
      else if (item is Series series)
      {
        yield return client.PublishStringAsync(topic, serializer.Serialize(new EntityUpdatePayload<Series>(EntityUpdateAction.Update, deviceId) { Entity = series }), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default);
      }
    }
  }
}
