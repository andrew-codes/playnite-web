namespace PlayniteWebExtension
{
  public interface IMqttSettings
  {
    string ClientId
    {
      get;
    }

    string DeviceName
    {
      get;
    }

    string DeviceId
    {
      get;
    }

    string ServerAddress
    {
      get;
    }

    string Username
    {
      get;
    }

    string HomeAssistantTopic
    {
      get;
    }

    string Password
    {
      get;
    }

    int? Port
    {
      get;
    }

    bool UseSecureConnection
    {
      get;
    }

    bool PublishCoverColors
    {
      get;
    }

    bool PublishCover
    {
      get;
    }

    bool PublishBackground
    {
      get;
    }
  }
}
