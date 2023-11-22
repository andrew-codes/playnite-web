using System;
using System.Collections.Generic;

namespace PlayniteWeb
{
  public class PlayniteWebSettings : ObservableObject
  {
    private string clientId = "Playnite";

    private string deviceId = "playnite";

    private string deviceName;

    private string serverAddress;

    private bool useSecureConnection = false;

    private int? port = 1883;

    private string username;

    private byte[] password;

    private DateTime lastPublish = DateTime.Now;

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

    public DateTime LastPublish {
      get => lastPublish;
      set => SetValue(ref lastPublish, value);
    }
  }
}
