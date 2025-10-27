using MQTTnet.Client;

namespace PlayniteWebMqtt.Services.Publishers.Mqtt.Credentials
{
  public class PasswordCredentials: IApplyMqttCredentials
  {
    private readonly string password;
    private readonly string username;

    public PasswordCredentials(string username, string password)
    {
      this.password = password;
      this.username = username;
    }

    public MqttClientOptionsBuilder ApplyCredentials(MqttClientOptionsBuilder options)
    {
      return options.WithCredentials(username, password);
    }
  }
}
