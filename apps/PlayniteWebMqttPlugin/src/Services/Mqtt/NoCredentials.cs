using MQTTnet.Client;

namespace PlayniteWebMqtt.Services.Mqtt.Credentials
{
  internal class NoCredentials : IApplyMqttCredentials
  {
    public MqttClientOptionsBuilder ApplyCredentials(MqttClientOptionsBuilder options)
    {
      return options;
    }
  }
}
