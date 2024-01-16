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

    public PlayniteWebSubscriber(IMqttClient mqtt, IManageTopics topicBuilder)
    {
      this.topicBuilder = topicBuilder;
      mqtt.SubscribeAsync(new MqttTopicFilterBuilder().WithTopic(topicBuilder.GetSubscribeTopic("#")).Build());
      mqtt.ApplicationMessageReceivedAsync += MesssageReceived;
    }

    public event EventHandler<Task> OnLibraryRequest;
    public event EventHandler<Guid> OnPlayGameRequest;

    private Task MesssageReceived(MqttApplicationMessageReceivedEventArgs args)
    {
      var task = Task.CompletedTask;
      if (args.ApplicationMessage.Topic == topicBuilder.GetSubscribeTopic(SubscribeTopics.RequestLibraryPublish) && OnLibraryRequest != null)
      {
        OnLibraryRequest.Invoke(this, task);
      }

      if (args.ApplicationMessage.Topic == topicBuilder.GetSubscribeTopic(SubscribeTopics.RequestStartGame) && OnPlayGameRequest != null)
      {
        var gameId = Guid.Parse(args.ApplicationMessage.ConvertPayloadToString());
        OnPlayGameRequest.Invoke(this, gameId);
      }

      return Task.WhenAll(task);
    }
  }
}
