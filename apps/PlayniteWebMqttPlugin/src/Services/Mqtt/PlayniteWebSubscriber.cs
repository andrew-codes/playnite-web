using MQTTnet;
using MQTTnet.Client;
using Playnite.SDK;
using PlayniteWebMqtt.Models;
using PlayniteWebMqtt.Services.Subscribers.Models;
using PlayniteWebMqtt.TopicManager;
using System;
using System.Dynamic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace PlayniteWebMqtt.Services.Subscribers.Mqtt
{
  internal class PlayniteWebSubscriber : ISubscribeToPlayniteWeb
  {
    private readonly IManageTopics topicBuilder;
    private readonly IMqttClient mqtt;
    private readonly IDeserializeObjects deserializer;
    private IPlayniteAPI _api;
    private readonly string deviceId;
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

      logger = LogManager.GetLogger();
    }

    private Task Client_ConnectedAsync(MqttClientConnectedEventArgs args)
    {
      var subscribeTopics = typeof(SubscribeTopics).GetFields().Select(field => field.GetValue(null)).Select(topicFragment => topicBuilder.GetRequestActionTopic(topicFragment.ToString())).ToList();

      Task.WaitAll(subscribeTopics.Select(topic => mqtt.SubscribeAsync(new MqttTopicFilterBuilder().WithTopic(topic).Build())).ToArray());

      return Task.CompletedTask;
    }

    public event EventHandler<ReleasePlatform> OnStartRelease;
    public event EventHandler<ReleasePlatform> OnInstallRelease;
    public event EventHandler<ReleasePlatform> OnUninstallRelease;
    public event EventHandler<ReleasePlatform> OnStopRelease;
    public event EventHandler<ReleasePlatform> OnRestartRelease;

    private Task MesssageReceived(MqttApplicationMessageReceivedEventArgs args)
    {
      var task = Task.CompletedTask;

      EventHandler<ReleasePlatform> eventHandler = null;
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
      var platformId = Guid.Parse(payloadData.PlatformId);
      var platform = _api.Database.Platforms.FirstOrDefault(p => p.Id.Equals(platformId));
      var releaseId = Guid.Parse(payloadData.ReleaseId);
      var release = _api.Database.Games.FirstOrDefault(g => g.Id.Equals(releaseId));
      if (release == null)
      {
        LogManager.GetLogger().Debug($"Game with ID {releaseId} not found for installation.");
        return Task.WhenAll(task);
      }

      var targetRelease = new ReleasePlatform(release, platform);
      eventHandler.Invoke(this, targetRelease);

      return Task.WhenAll(task);
    }
  }
}
