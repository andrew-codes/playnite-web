using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlayniteWeb.Models
{

  internal enum ConnectionState
  {
    online,
    offline
  }

  internal class Connection
  {
    public Connection(string pluginVersion, ConnectionState state)
    {
      PluginVersion = pluginVersion;
      State = Enum.GetName(typeof(ConnectionState), state);
    }

    public string PluginVersion { get; private set; }
    public string State { get; private set; }
  }
}
