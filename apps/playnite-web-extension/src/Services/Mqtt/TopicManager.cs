using MQTTnet.Client;

namespace PlayniteWebExtension.Services.Mqtt
{
  public class TopicManager : IManageTopics
  {
    private readonly IMqttClient client;

    private readonly IMqttSettings settings;

    public TopicManager(IMqttClient client, IMqttSettings settings)
    {
      this.client = client;
      this.settings = settings;
    }

    public bool TryGetPublishTopic(string subTopic, out string topicOut)
    {
      if (!client.IsConnected || string.IsNullOrEmpty(settings.DeviceId))
      {
        topicOut = null;
        return false;
      }

      if (!string.IsNullOrEmpty(subTopic))
      {
        topicOut = $"playnite/{settings.DeviceId}/{subTopic}";
        return true;
      }

      topicOut = null;
      return false;
    }

    public bool TryGetSubscribeTopic(string subTopic, out string topicOut)
    {
      if (!client.IsConnected || string.IsNullOrEmpty(settings.DeviceId))
      {
        topicOut = null;
        return false;
      }

      if (!string.IsNullOrEmpty(subTopic))
      {
        topicOut = $"playnite/{subTopic}";
        return true;
      }

      topicOut = null;
      return false;
    }
  }
}
