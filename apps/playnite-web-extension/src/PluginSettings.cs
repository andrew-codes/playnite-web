using System;
using System.Collections.Generic;
using System.Text;

namespace PlayniteWebExtension
{
  public class PluginSettings : ObservableObject
  {
    public PluginSettings()
    {
    }

    private string clientId = "Playnite";

    private string deviceId = "playnite";

    private string deviceName;

    private string serverAddress;

    private bool useSecureConnection = false;

    private string homeAssistantTopic = "homeassistant";

    private int? port = 1883;

    private string username;

    private byte[] password;

    private bool publishCoverColors = false;

    private bool publishCover = true;

    private bool publishBackground = false;

    public string ClientId
    {
      get => clientId;
      set => SetValue(ref clientId, value);
    }

    public string DeviceName
    {
      get => deviceName;
      set => SetValue(ref deviceName, value);
    }

    public string DeviceId
    {
      get => deviceId;
      set => SetValue(ref deviceId, value);
    }

    public string ServerAddress
    {
      get => serverAddress;
      set => SetValue(ref serverAddress, value);
    }

    public string Username
    {
      get => username;
      set => SetValue(ref username, value);
    }

    public string HomeAssistantTopic
    {
      get => homeAssistantTopic;
      set => SetValue(ref homeAssistantTopic, value);
    }

    public byte[] Password
    {
      get => password;
      set => SetValue(ref password, value);
    }

    public int? Port
    {
      get => port;
      set => SetValue(ref port, value);
    }

    public bool UseSecureConnection
    {
      get => useSecureConnection;
      set => SetValue(ref useSecureConnection, value);
    }

    public bool PublishCoverColors
    {
      get => publishCoverColors;
      set => SetValue(ref publishCoverColors, value);
    }

    public bool PublishCover
    {
      get => publishCover;
      set => SetValue(ref publishCover, value);
    }

    public bool PublishBackground
    {
      get => publishBackground;
      set => SetValue(ref publishBackground, value);
    }
  }
}
