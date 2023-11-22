using MQTTnet.Client;

namespace PlayniteWeb.UI
{
  internal class NoCredentials : IApplyMqttCredentials
  {
    public MqttClientOptionsBuilder ApplyCredentials(MqttClientOptionsBuilder options)
    {
      return options;
    }
  }
}
