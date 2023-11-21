namespace PlayniteWebExtension.Services.Mqtt
{
  public interface IManageTopics
  {

    bool TryGetPublishTopic(string subTopic, out string topicOut);
    bool TryGetSubscribeTopic(string subTopic, out string topicOut);
  }
}
