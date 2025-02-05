using MQTTnet;
using MQTTnet.Client;
using Playnite.SDK;
using PlayniteWeb.Models;
using PlayniteWeb.Services.Subscribers.Models;
using PlayniteWeb.TopicManager;
using System;
using System.Dynamic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Subscribers.Mqtt
{
  internal class PlayniteWebSubscriber : ISubscribeToPlayniteWeb
  {
    private readonly IManageTopics topicBuilder;
    private readonly IMqttClient mqtt;
    private readonly IDeserializeObjects deserializer;
    private IPlayniteAPI _api;
    private readonly string deviceId;
    private Regex updateTopicExpression;
    private ILogger logger;

    public PlayniteWebSubscriber(IMqttClient mqtt, IManageTopics topicBuilder, IDeserializeObjects deserializer, IPlayniteAPI api, string deviceId)
    {
      this.topicBuilder = topicBuilder;
      this.mqtt = mqtt;
      mqtt.ApplicationMessageReceivedAsync += MesssageReceived;
      mqtt.ConnectedAsync += Client_ConnectedAsync;
      this.deserializer = deserializer;
      _api = api;
      this.deviceId = deviceId;
      updateTopicExpression = new Regex("playnite/([a-zA-Z0-9-]+)/update/([a-zA-Z]+)/([a-zA-Z0-9-]+)");
      logger  = LogManager.GetLogger();
    }

    private Task Client_ConnectedAsync(MqttClientConnectedEventArgs args)
    {
      var subscribeTopics = typeof(SubscribeTopics).GetFields().Select(field => field.GetValue(null)).ToList();

      Task.WaitAll(subscribeTopics.Select(topic => mqtt.SubscribeAsync(new MqttTopicFilterBuilder().WithTopic(topicBuilder.GetRequestActionTopic(topic.ToString())).Build())).ToArray());
      mqtt.SubscribeAsync(new MqttTopicFilterBuilder().WithTopic("playnite/+/update/+/+").Build()).Wait();

      return Task.CompletedTask;
    }

    public event EventHandler<Task> OnUpdateLibrary;
    public event EventHandler<Release> OnStartRelease;
    public event EventHandler<Release> OnInstallRelease;
    public event EventHandler<Release> OnUninstallRelease;
    public event EventHandler<Release> OnStopRelease;
    public event EventHandler<Release> OnRestartRelease;
    public event EventHandler<UpdateEntity> OnUpdateEntity;

    private Task MesssageReceived(MqttApplicationMessageReceivedEventArgs args)
    {
      var task = Task.CompletedTask;
      if (args.ApplicationMessage.Topic == topicBuilder.GetRequestActionTopic(SubscribeTopics.RequestLibraryPublish) && OnUpdateLibrary != null)
      {
        OnUpdateLibrary.Invoke(this, task);
        return Task.WhenAll(task);
      }

      var isUpdateTopic = updateTopicExpression.IsMatch(args.ApplicationMessage.Topic);
      if (isUpdateTopic && OnUpdateEntity != null)
      {
        var match = updateTopicExpression.Match(args.ApplicationMessage.Topic);
        var entityType = match.Groups[2].Value;
        var entityId = Guid.Parse(match.Groups[3].Value);
        var deviceId = match.Groups[1].Value;
        dynamic payload = deserializer.Deserialize(args.ApplicationMessage.ConvertPayloadToString());
        if (payload == null)
        {
          logger.Debug($"Payload is null. Skipping processing update topic; {args.ApplicationMessage.Topic}.");
          return task;
        }
        if (payload.From == deviceId)
        {
          logger.Debug($"Update message from device self. Skipping processing update topic; {args.ApplicationMessage.Topic}.");
          return task;
        }

        if (payload.Entity == null)
        {
          logger.Debug("Entity is null. Skipping processing update topic; {args.ApplicationMessage.Topic}.");
          return task;
        }
        if (payload.Action == null)
        {
          logger.Debug("Action is null. Skipping processing update topic; {args.ApplicationMessage.Topic}.");
          return task;
        }

        var updateEntity = new UpdateEntity() { Entity = payload.Entity, EntityType = entityType, EntityId = entityId, UpdateAction = payload.Action };
        OnUpdateEntity.Invoke(this, updateEntity);

        return Task.WhenAll(task);
      }

      EventHandler<Release> eventHandler = null;
      if (args.ApplicationMessage.Topic == topicBuilder.GetRequestActionTopic(SubscribeTopics.RequestStartRelease) && OnStartRelease != null)
      {
        eventHandler = OnStartRelease;
      }
      else if (args.ApplicationMessage.Topic == topicBuilder.GetRequestActionTopic(SubscribeTopics.RequestInstallRelease) && OnInstallRelease != null)
      {
        eventHandler = OnInstallRelease;
      }
      else if (args.ApplicationMessage.Topic == topicBuilder.GetRequestActionTopic(SubscribeTopics.RequestUninstallRelease) && OnUninstallRelease != null)
      {
        eventHandler = OnUninstallRelease;
      }
      else if (args.ApplicationMessage.Topic == topicBuilder.GetRequestActionTopic(SubscribeTopics.RequestStopRelease) && OnStopRelease != null)
      {
        eventHandler = OnStopRelease;
      }
      else if (args.ApplicationMessage.Topic == topicBuilder.GetRequestActionTopic(SubscribeTopics.RequestRestartRelease) && OnRestartRelease != null)
      {
        eventHandler = OnRestartRelease;
      }


      if (eventHandler == null)
      {
        return Task.WhenAll(task);
      }

      dynamic payloadData = deserializer.Deserialize(args.ApplicationMessage.ConvertPayloadToString());
      var platformId = Guid.Parse(payloadData.Game.Platform.Id);
      var platform = _api.Database.Platforms.FirstOrDefault(p => p.Id.Equals(platformId));
      var releaseId = Guid.Parse(payloadData.Game.Id);
      var release = _api.Database.Games.FirstOrDefault(g => g.Id.Equals(releaseId));
      if (release == null)
      {
        LogManager.GetLogger().Debug($"Game with ID {releaseId} not found for installation.");
        return Task.WhenAll(task);
      }

      var targetRelease = new Release(release, platform);
      targetRelease.ProcessId = payloadData.Game.ProcessId;
      eventHandler.Invoke(this, targetRelease);

      return Task.WhenAll(task);
    }
  }
}
