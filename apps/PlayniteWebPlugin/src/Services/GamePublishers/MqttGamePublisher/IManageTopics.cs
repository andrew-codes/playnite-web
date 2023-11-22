namespace PlayniteWeb.Services.Mqtt
{
  public interface IManageTopics
  {
    string GetPublishTopic(string subTopic);
    string GetSubscribeTopic(string subTopic);
  }
}
