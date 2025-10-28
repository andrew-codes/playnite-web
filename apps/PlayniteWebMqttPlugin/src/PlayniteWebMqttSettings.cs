using System;
using System.Collections.Generic;
using Playnite.SDK;

namespace PlayniteWebMqtt
{
  public class PlayniteWebMqttSettings : ObservableObject
  {
    private string clientId = Guid.NewGuid().ToString();

    private string deviceId = Guid.NewGuid().ToString();

    private string deviceName;

    private string serverAddress;

    private bool useSecureConnection = false;

    private int? port = 1883;

    private string username;

    private byte[] password;

    private DateTime lastPublish = DateTime.Now;

    private int publishingThrottle = 30;

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

    public DateTime LastPublish
    {
      get => lastPublish;
      set => SetValue(ref lastPublish, value);
    }

    public int PublishingThrottle { get => publishingThrottle; set => SetValue(ref publishingThrottle, value); }
  }
}
