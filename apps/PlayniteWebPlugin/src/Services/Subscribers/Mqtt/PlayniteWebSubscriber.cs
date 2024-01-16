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

    public event EventHandler<Task> LibraryRefreshRequest;

    private Task MesssageReceived(MqttApplicationMessageReceivedEventArgs args)
    {
      var task = Task.CompletedTask;
      if (args.ApplicationMessage.Topic == topicBuilder.GetSubscribeTopic(SubscribeTopics.RequestLibraryPublish) && LibraryRefreshRequest != null)
      {
        LibraryRefreshRequest.Invoke(this, task);
      }

      return Task.WhenAll(task);
    }
  }
}
