namespace PlayniteWebMqtt.TopicManager
{
  public interface IManageTopics
  {
    string GetPublishTopic(string subTopic);
    string GetRequestActionTopic(string subTopic);
  }
}
