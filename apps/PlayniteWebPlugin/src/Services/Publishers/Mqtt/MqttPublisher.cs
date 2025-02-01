using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Diagnostics;
using MQTTnet.Protocol;
using PlayniteWeb.TopicManager;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.Mqtt
{
  internal class MqttPublisher : IConnectPublisher<IMqttClient>, IMqttClient
  {
    private readonly IManageTopics topicBuilder;
    private IMqttClient client;
    private readonly string clientId;
    public Func<Task> DisconnectingAsync;
    public IList<string> PublishedTopics { get; } = new List<string>();

    public bool IsConnected => client.IsConnected;

    public MqttClientOptions Options => client.Options;

    public MqttPublisher(IMqttClient client, IManageTopics topicBuilder, string clientId)
    {
      this.client = client;
      this.clientId = clientId;

      this.topicBuilder = topicBuilder;
      this.client.ApplicationMessageReceivedAsync += Client_ApplicationMessageReceivedAsync;
      this.client.ConnectedAsync += Client_ConnectedAsync;
      this.client.ConnectingAsync += Client_ConnectingAsync;
      this.client.DisconnectedAsync += Client_DisconnectedAsync;
      this.client.InspectPacketAsync += Client_InspectPacketAsync;

    }

    private Task Client_DisconnectedAsync(MqttClientDisconnectedEventArgs arg)
    {
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
      if (IsConnected)
      {
        return;
      }
      client = options.ApplyOptions(client);
    }

    public Task StartDisconnect()
    {
      if (!IsConnected)
      {
        return Task.CompletedTask;
      }

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
      PublishedTopics.Add(applicationMessage.Topic);
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
  }
}
