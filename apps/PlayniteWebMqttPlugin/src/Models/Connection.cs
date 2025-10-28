using System;

namespace PlayniteWebMqtt.Models
{

  internal enum ConnectionState
  {
    online,
    offline
  }

  internal class Connection
  {
    public Connection(string pluginVersion, ConnectionState state, string clientId)
    {
      PluginVersion = pluginVersion;
      ClientId = clientId;
      State = Enum.GetName(typeof(ConnectionState), state);
    }

    public string PluginVersion { get; private set; }
    public string State { get; private set; }
    public string ClientId { get; private set; }
  }
}
