using System;
using System.Collections.Generic;

namespace PlayniteWeb
{
  public class PlayniteWebSettings : ObservableObject
  {
    private Guid deviceId;

    private byte[] token;

    private string deviceName;

    private string serverAddress;

    private bool useSecureConnection = true;

    private int? port = 443;

    private string username;

    private byte[] password;

    private IDictionary<Guid, Guid> sourcePlatforms = new Dictionary<Guid, Guid>();

    private DateTime? lastPublish;

    public string DeviceName
    {
      get => deviceName;
      set => SetValue(ref deviceName, value);
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
      set
      {
        SetValue(ref useSecureConnection, value);
        if (this.port == null)
        {
          this.Port = value ? 443 : 80;
        }
      }
    }

    public Guid DeviceId
    {
      get => deviceId;
      set => SetValue(ref deviceId, value);
    }

    public DateTime? LastPublish {
      get => lastPublish;
      set => SetValue(ref lastPublish, value);
    }

    public byte[] Token {
      get => token;
      set => SetValue(ref token, value);
    }

    public IDictionary<Guid, Guid> SourcePlatforms
      {
      get => sourcePlatforms;
      set => SetValue(ref sourcePlatforms, value);
    }
  }
}
