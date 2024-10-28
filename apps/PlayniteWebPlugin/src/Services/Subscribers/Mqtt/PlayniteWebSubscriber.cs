using MQTTnet;
using MQTTnet.Client;
using PlayniteWeb.TopicManager;
using System;
using System.Threading.Tasks;
using System.Linq;
using PlayniteWeb.Services.Subscribers.Models;
using Playnite.SDK;
using System.Text.RegularExpressions;
using Playnite.SDK.Models;
using PlayniteWeb.Models;

namespace PlayniteWeb.Services.Subscribers.Mqtt
{
  internal class PlayniteWebSubscriber : ISubscribeToPlayniteWeb
  {
    private readonly IManageTopics topicBuilder;
    private readonly IMqttClient mqtt;
    private readonly IDeserializeObjects deserializer;
    private IPlayniteAPI _api;

    public PlayniteWebSubscriber(IMqttClient mqtt, IManageTopics topicBuilder, IDeserializeObjects deserializer, IPlayniteAPI api)
    {
      this.topicBuilder = topicBuilder;
      this.mqtt = mqtt;
      mqtt.ApplicationMessageReceivedAsync += MesssageReceived;
      mqtt.ConnectedAsync += Client_ConnectedAsync;
      this.deserializer = deserializer;
      _api = api;
    }

    private Task Client_ConnectedAsync(MqttClientConnectedEventArgs args)
    {
      var subscribeTopics = typeof(SubscribeTopics).GetFields().Select(field => field.GetValue(null)).ToList();

      Task.WaitAll(subscribeTopics.Select(topic => mqtt.SubscribeAsync(new MqttTopicFilterBuilder().WithTopic(topicBuilder.GetSubscribeTopic(topic.ToString())).Build())).ToArray());
      return Task.CompletedTask;
    }

    public event EventHandler<Task> OnUpdateLibrary;
    public event EventHandler<Release> OnStartRelease;
    public event EventHandler<Release> OnInstallRelease;
    public event EventHandler<Release> OnUninstallRelease;
    public event EventHandler<Release> OnStopRelease;
    public event EventHandler<Release> OnRestartRelease;

    private Task MesssageReceived(MqttApplicationMessageReceivedEventArgs args)
    {
      var task = Task.CompletedTask;
      if (args.ApplicationMessage.Topic == topicBuilder.GetSubscribeTopic(SubscribeTopics.RequestLibraryPublish) && OnUpdateLibrary != null)
      {
        OnUpdateLibrary.Invoke(this, task);
        return Task.WhenAll(task);
      }

      EventHandler<Release> eventHandler = null;
      if (args.ApplicationMessage.Topic == topicBuilder.GetSubscribeTopic(SubscribeTopics.RequestStartRelease) && OnStartRelease != null)
      {
        eventHandler = OnStartRelease;
      }
      else if (args.ApplicationMessage.Topic == topicBuilder.GetSubscribeTopic(SubscribeTopics.RequestInstallRelease) && OnInstallRelease != null)
      {
        eventHandler = OnInstallRelease;
      }
      else if (args.ApplicationMessage.Topic == topicBuilder.GetSubscribeTopic(SubscribeTopics.RequestUninstallRelease) && OnUninstallRelease != null)
      {
        eventHandler = OnUninstallRelease;
      }
      else if (args.ApplicationMessage.Topic == topicBuilder.GetSubscribeTopic(SubscribeTopics.RequestStopRelease) && OnStopRelease != null)
      {
        eventHandler = OnStopRelease;
      }
      else if (args.ApplicationMessage.Topic == topicBuilder.GetSubscribeTopic(SubscribeTopics.RequestRestartRelease) && OnRestartRelease != null)
      {
        eventHandler = OnRestartRelease;
      }

      if (eventHandler == null)
      {
        return Task.WhenAll(task);
      }

      var payloadData = deserializer.Deserialize<StartReleasePayload>(args.ApplicationMessage.ConvertPayloadToString());
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
