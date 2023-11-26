using MQTTnet.Client;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;

namespace PlayniteWeb.UI
{
  internal class MqttPublisherOptions : IApplyPublisherOptions<IMqttClient>
  {

    private readonly string clientId;
    private readonly string host;
    private readonly int? port;
    private readonly string username;
    private readonly byte[] password;
    private readonly byte[] entropy;

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
      if (string.IsNullOrEmpty(username) && password.Any())
      {
        var plainTextPassword = Encoding.UTF8.GetString(ProtectedData.Unprotect(password, entropy, DataProtectionScope.CurrentUser));
        creds = new PasswordCredentials(username, plainTextPassword);
      }
      mqttOptionsBuilder = creds.ApplyCredentials(mqttOptionsBuilder);

      try
      {
        client.ConnectAsync(mqttOptionsBuilder.Build(), cancelToken).Wait(cancelToken);
      }
      catch { }

      return client;
    }
  }
}
