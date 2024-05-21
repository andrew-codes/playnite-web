using MQTTnet;
using MQTTnet.Client;
using PlayniteWeb.TopicManager;
using System;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Subscribers.Mqtt
{
  internal class PlayniteWebSubscriber : ISubscribeToPlayniteWeb
  {
    private readonly IManageTopics topicBuilder;
    private readonly IMqttClient mqtt;

    public PlayniteWebSubscriber(IMqttClient mqtt, IManageTopics topicBuilder)
    {
      this.topicBuilder = topicBuilder;
      this.mqtt = mqtt;
      mqtt.ApplicationMessageReceivedAsync += MesssageReceived;
      mqtt.ConnectedAsync += Client_ConnectedAsync;
    }

    private Task Client_ConnectedAsync(MqttClientConnectedEventArgs args)
    {
      return mqtt.SubscribeAsync(new MqttTopicFilterBuilder().WithTopic(topicBuilder.GetSubscribeTopic("#")).Build());
    }

    public event EventHandler<Task> OnLibraryRequest;
    public event EventHandler<Guid> OnStartGameRequest;
    public event EventHandler<Guid> OnInstallGameRequest;
    public event EventHandler<Guid> OnUninstallGameRequest;

    private Task MesssageReceived(MqttApplicationMessageReceivedEventArgs args)
    {
      var task = Task.CompletedTask;
      if (args.ApplicationMessage.Topic == topicBuilder.GetSubscribeTopic(SubscribeTopics.RequestLibraryPublish) && OnLibraryRequest != null)
      {
        OnLibraryRequest.Invoke(this, task);
      }
      else if (args.ApplicationMessage.Topic == topicBuilder.GetSubscribeTopic(SubscribeTopics.RequestStartGame) && OnStartGameRequest != null)
      {
        var gameId = Guid.Parse(args.ApplicationMessage.ConvertPayloadToString());
        OnStartGameRequest.Invoke(this, gameId);
      }
      else if (args.ApplicationMessage.Topic == topicBuilder.GetSubscribeTopic(SubscribeTopics.RequestInstallGame) && OnInstallGameRequest != null)
      {
        var gameId = Guid.Parse(args.ApplicationMessage.ConvertPayloadToString());
        OnInstallGameRequest.Invoke(this, gameId);
      }
      else if (args.ApplicationMessage.Topic == topicBuilder.GetSubscribeTopic(SubscribeTopics.RequestUninstallGame) && OnUninstallGameRequest != null)
      {
        var gameId = Guid.Parse(args.ApplicationMessage.ConvertPayloadToString());
        OnUninstallGameRequest.Invoke(this, gameId);
      }

      return Task.WhenAll(task);
    }
  }
}
