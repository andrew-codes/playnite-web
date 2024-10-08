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
      var subscribeTopics = typeof(SubscribeTopics).GetFields(System.Reflection.BindingFlags.Public).Select(field => field.GetValue(null)).ToList();

      return Task.WhenAll(subscribeTopics.Select(topic => mqtt.SubscribeAsync(new MqttTopicFilterBuilder().WithTopic(topicBuilder.GetSubscribeTopic(topic.ToString())).Build())));
    }

    public event EventHandler<Task> OnUpdateLibrary;
    public event EventHandler<Release> OnStartRelease;
    public event EventHandler<Release> OnInstallRelease;
    public event EventHandler<Release> OnUninstallRelease;

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

      if (eventHandler == null)
      {
        return Task.WhenAll(task);
      }

      var payloadData = deserializer.Deserialize<StartReleasePayload>(args.ApplicationMessage.ConvertPayloadToString());
      var platformId = Guid.Parse(payloadData.PlatformId);
      var platform = _api.Database.Platforms.FirstOrDefault(p => p.Id.Equals(platformId));
      var releaseId = Guid.Parse(payloadData.ReleaseId);
      var release = _api.Database.Games.FirstOrDefault(g => g.Id.Equals(releaseId));
      if (release == null)
      {
          LogManager.GetLogger().Debug($"Game with ID {releaseId} not found for installation.");
        return Task.WhenAll(task);
      }

      eventHandler.Invoke(this, new Release(release, platform));

      return Task.WhenAll(task);
    }
  }
}
