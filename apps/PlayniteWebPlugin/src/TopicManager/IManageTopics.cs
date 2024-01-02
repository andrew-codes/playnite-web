namespace PlayniteWeb.TopicManager
{
  public interface IManageTopics
  {
    string GetPublishTopic(string subTopic);
    string GetSubscribeTopic(string subTopic);
  }
}
