using MQTTnet.Client;

namespace PlayniteWeb.Services.Publishers.Mqtt
{
  public interface IApplyMqttCredentials
  {
    MqttClientOptionsBuilder ApplyCredentials(MqttClientOptionsBuilder options);
  }
}
