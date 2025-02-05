using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Diagnostics;
using MQTTnet.Protocol;
using Playnite.SDK;
using PlayniteWeb.Models;
using PlayniteWeb.TopicManager;
using PlayniteWeb.UI;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.Mqtt
{
  internal class MqttClient : IConnectPublisher<IMqttClient>, IMqttClient
  {
    private IMqttClient client;
    public Func<Task> DisconnectingAsync;

    public bool IsConnected => client.IsConnected;

    public MqttClientOptions Options => client.Options;

    private readonly ILogger logger = LogManager.GetLogger();
    private readonly IManageTopics topicManager;
    private readonly ISerializeObjects serializer;
    private readonly string _version;
    private readonly PlayniteWebSettingsViewModel settings;
    private readonly Guid pluginId;
    private bool IsReconnectInProgress = false;
    private bool IsShutDownInProgress = false;

    public MqttClient(IMqttClient client, IManageTopics topicManager, string version, PlayniteWebSettingsViewModel settings, Guid pluginId, ISerializeObjects serializer)
    {
      this.client = client;

      this.client.ApplicationMessageReceivedAsync += Client_ApplicationMessageReceivedAsync;
      this.client.ConnectedAsync += Client_ConnectedAsync;
      this.client.ConnectingAsync += Client_ConnectingAsync;
      this.client.DisconnectedAsync += Client_DisconnectedAsync;
      this.client.InspectPacketAsync += Client_InspectPacketAsync;
      this.topicManager = topicManager;
      _version = version;
      this.settings = settings;
      this.pluginId = pluginId;
      this.serializer = serializer;
    }

    private Task Client_DisconnectedAsync(MqttClientDisconnectedEventArgs arg)
    {
      if (!IsShutDownInProgress)
      {
        AttemptReconnect().Wait();
      }
      if (DisconnectedAsync == null) { return Task.CompletedTask; }
      return DisconnectedAsync(arg);
    }

    private Task Client_ConnectingAsync(MqttClientConnectingEventArgs arg)
    {
      if (ConnectingAsync == null) { return Task.CompletedTask; }
      return ConnectingAsync(arg);
    }

    private Task Client_ConnectedAsync(MqttClientConnectedEventArgs arg)
    {
      client.PublishStringAsync(topicManager.GetPublishTopic(PublishTopics.Connection()), serializer.Serialize(new Connection(_version, ConnectionState.online, settings.Settings.DeviceId)), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default).Wait();
      if (ConnectedAsync == null) { return Task.CompletedTask; }
      return ConnectedAsync(arg);
    }

    private Task Client_InspectPacketAsync(InspectMqttPacketEventArgs arg)
    {
      if (InspectPacketAsync == null) { return Task.CompletedTask; }
      return InspectPacketAsync(arg);
    }

    private Task Client_ApplicationMessageReceivedAsync(MqttApplicationMessageReceivedEventArgs arg)
    {
      if (ApplicationMessageReceivedAsync == null) { return Task.CompletedTask; }
      return ApplicationMessageReceivedAsync(arg);
    }

    public event Func<MqttApplicationMessageReceivedEventArgs, Task> ApplicationMessageReceivedAsync;
    public event Func<MqttClientConnectedEventArgs, Task> ConnectedAsync;
    public event Func<MqttClientConnectingEventArgs, Task> ConnectingAsync;
    public event Func<MqttClientDisconnectedEventArgs, Task> DisconnectedAsync;
    public event Func<InspectMqttPacketEventArgs, Task> InspectPacketAsync;

    public void StartConnection(IApplyPublisherOptions<IMqttClient> options)
    {
      IsShutDownInProgress = false;
      if (IsConnected)
      {
        return;
      }
      client = options.ApplyOptions(client);
    }

    public Task StartDisconnect()
    {
      IsShutDownInProgress = true;
      if (!IsConnected)
      {
        return Task.CompletedTask;
      }

      client.PublishStringAsync(topicManager.GetPublishTopic(PublishTopics.Connection()), serializer.Serialize(new Connection(_version, ConnectionState.offline, settings.Settings.DeviceId)), MqttQualityOfServiceLevel.ExactlyOnce, retain: true, cancellationToken: default);

      if (DisconnectingAsync != null)
      {
        return DisconnectingAsync().ContinueWith((t) => client.DisconnectAsync());
      }
      else
      {
        return client.DisconnectAsync();
      }
    }

    public Task<MqttClientConnectResult> ConnectAsync(MqttClientOptions options, CancellationToken cancellationToken = default)
    {
      return client.ConnectAsync(options, cancellationToken);
    }

    public Task DisconnectAsync(MqttClientDisconnectOptions options, CancellationToken cancellationToken = default)
    {
      return client.DisconnectAsync(options, cancellationToken);
    }

    public Task PingAsync(CancellationToken cancellationToken = default)
    {
      return client.PingAsync(cancellationToken);
    }

    public Task<MqttClientPublishResult> PublishAsync(MqttApplicationMessage applicationMessage, CancellationToken cancellationToken = default)
    {
      if (!IsConnected)
      {
        logger.Warn($"Client is not connected; message is not being published.");
        return Task.FromResult<MqttClientPublishResult>(null);
      }

      logger.Debug($"Publishing message to topic: {applicationMessage.Topic}");
      return client.PublishAsync(applicationMessage, cancellationToken);
    }

    public Task SendExtendedAuthenticationExchangeDataAsync(MqttExtendedAuthenticationExchangeData data, CancellationToken cancellationToken = default)
    {
      return client.SendExtendedAuthenticationExchangeDataAsync(data, cancellationToken);
    }

    public Task<MqttClientSubscribeResult> SubscribeAsync(MqttClientSubscribeOptions options, CancellationToken cancellationToken = default)
    {
      return client.SubscribeAsync(options, cancellationToken);
    }

    public Task<MqttClientUnsubscribeResult> UnsubscribeAsync(MqttClientUnsubscribeOptions options, CancellationToken cancellationToken = default)
    {
      return client.UnsubscribeAsync(options, cancellationToken);
    }

    public void Dispose()
    {
      client.Dispose();
    }

    private async Task AttemptReconnect()
    {
      int retryCount = 0;
      const int maxDelayInMinutes = 60;

      if (IsReconnectInProgress)
      {
        return;
      }

      IsReconnectInProgress = true;

      while (!IsConnected)
      {
        try
        {
          retryCount++;
          int delayInSeconds = (int)Math.Min(Math.Pow(2, retryCount), maxDelayInMinutes * 60);

          logger.Info($"Attempting to reconnect... (Attempt {retryCount}, waiting {delayInSeconds} seconds)");
          await Task.Delay(TimeSpan.FromSeconds(delayInSeconds));

          var settings = this.settings.Settings;
          var options = new MqttPublisherOptions(settings.ClientId, settings.ServerAddress, settings.Port, settings.Username, settings.Password, pluginId.ToByteArray());
          StartConnection(options);

          if (IsConnected)
          {
            logger.Info("Reconnected to MQTT server.");
          }
        }
        catch (Exception ex)
        {
          logger.Error(ex, "Reconnection attempt failed.");
        }
      }

      IsReconnectInProgress = false;
    }
  }
}
