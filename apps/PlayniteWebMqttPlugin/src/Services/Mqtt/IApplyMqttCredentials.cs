using MQTTnet.Client;

namespace PlayniteWebMqtt.Services.Mqtt
{
  public interface IApplyMqttCredentials
  {
    MqttClientOptionsBuilder ApplyCredentials(MqttClientOptionsBuilder options);
  }
}
