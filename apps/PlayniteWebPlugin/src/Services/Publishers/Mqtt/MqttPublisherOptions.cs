using MQTTnet.Client;
using Playnite.SDK;
using PlayniteWeb.Services.Publishers.Mqtt.Credentials;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;

namespace PlayniteWeb.Services.Publishers.Mqtt
{
  internal class MqttPublisherOptions : IApplyPublisherOptions<IMqttClient>
  {

    private readonly string clientId;
    private readonly string host;
    private readonly int? port;
    private readonly string username;
    private readonly byte[] password;
    private readonly byte[] entropy;
    private readonly ILogger logger = LogManager.GetLogger();

    public MqttPublisherOptions(string clientId, string host, int? port, string username, byte[] password, byte[] entropy)
    {
      this.clientId = clientId;
      this.host = host;
      this.port = port;
      this.username = username;
      this.password = password ?? new byte[] { };
      this.entropy = entropy;
    }

    public IMqttClient ApplyOptions(IMqttClient client, CancellationToken cancelToken = default)
    {
      var mqttOptionsBuilder = new MqttClientOptionsBuilder()
        .WithClientId(clientId)
        .WithTcpServer(host, port);

      IApplyMqttCredentials creds = new NoCredentials();
      if (!string.IsNullOrEmpty(username) && password.Any())
      {
        var plainTextPassword = Encoding.UTF8.GetString(ProtectedData.Unprotect(password, entropy, DataProtectionScope.CurrentUser));
        creds = new PasswordCredentials(username, plainTextPassword);
      }
      mqttOptionsBuilder = creds.ApplyCredentials(mqttOptionsBuilder);

      try
      {
        client.ConnectAsync(mqttOptionsBuilder.Build(), cancelToken).Wait(cancelToken);
      }
      catch(Exception e) {
        logger.Error(e.Message);
      }

      return client;
    }
  }
}
