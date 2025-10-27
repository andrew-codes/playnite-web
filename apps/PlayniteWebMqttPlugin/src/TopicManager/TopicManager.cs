using System;

namespace PlayniteWebMqtt.TopicManager
{
  public class TopicManager : IManageTopics
  {
    private readonly PlayniteWebMqttSettings settings;

    public TopicManager(PlayniteWebMqttSettings settings)
    {
      this.settings = settings;
    }

    public string GetPublishTopic(string subTopic)
    {
      if (string.IsNullOrEmpty(settings.DeviceId))
      {
        throw new NotSupportedException("Device ID is required to be set in the Plugin Settings pane.");
      }
      return $"playnite/{settings.DeviceId}/{subTopic}";
    }

    public string GetRequestActionTopic(string subTopic)
    {
      return $"playnite/{settings.DeviceId}/request/{subTopic}";
    }
  }
}
