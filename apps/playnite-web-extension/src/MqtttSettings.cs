using System;
using System.Collections.Generic;
using System.Text;

namespace PlayniteWebPlugin
{
  public class MqttSettings : ObservableObject
  {
    public MqttSettings()
    {
      ServerAddress = Environment.GetEnvironmentVariable("PLAYNITE_WEB_MQTT_HOST", EnvironmentVariableTarget.Process) ?? "localhost";
      if (int.TryParse(Environment.GetEnvironmentVariable("PLAYNITE_WEB_MQTT_PORT", EnvironmentVariableTarget.Process), out var _port))
      {
        Port = _port;
      }
      else
      {
        Port = 1883;
      }
      Username = Environment.GetEnvironmentVariable("PLAYNITE_WEB_MQTT_USERNAME", EnvironmentVariableTarget.Process);

      var _password = Environment.GetEnvironmentVariable("PLAYNITE_WEB_MQTT_PASSWORD", EnvironmentVariableTarget.Process);
      Password = Encoding.UTF8.GetBytes(_password);

      DeviceId = Environment.GetEnvironmentVariable("PLAYNITE_WEB_MQTT_DEVICE_ID", EnvironmentVariableTarget.Process) ?? "playnite";
      DeviceName = Environment.GetEnvironmentVariable("PLAYNITE_WEB_MQTT_DEVICE_NAME", EnvironmentVariableTarget.Process) ?? "Desktop Playnite";
      if (bool.TryParse(Environment.GetEnvironmentVariable("PLAYNITE_WEB_PUBLISH_COVER_COLORS", EnvironmentVariableTarget.Process), out var _publishCoverColors))
      {
        PublishCoverColors = _publishCoverColors;
      }
      if (bool.TryParse(Environment.GetEnvironmentVariable("PLAYNITE_WEB_PUBLISH_COVER", EnvironmentVariableTarget.Process), out var _publishCover))
      {
        PublishCover = _publishCover;
      }
      if (bool.TryParse(Environment.GetEnvironmentVariable("PLAYNITE_WEB_PUBLISH_BACKGROUND", EnvironmentVariableTarget.Process), out var _publishBackground))
      {
        PublishBackground = _publishBackground;
      }
      if (bool.TryParse(Environment.GetEnvironmentVariable("PLAYNITE_WEB_USE_SECURE_CONNECTION", EnvironmentVariableTarget.Process), out var _userSecureConnection))
      {
        UseSecureConnection = _userSecureConnection;
      }
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
