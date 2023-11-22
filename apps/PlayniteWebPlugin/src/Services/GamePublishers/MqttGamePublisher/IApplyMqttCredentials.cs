using MQTTnet.Client;

namespace PlayniteWeb
{
  public interface IApplyMqttCredentials
  {
    MqttClientOptionsBuilder ApplyCredentials(MqttClientOptionsBuilder options);
  }
}
