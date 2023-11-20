using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Protocol;
using Playnite.SDK;
using Playnite.SDK.Events;
using Playnite.SDK.Models;
using Playnite.SDK.Plugins;
using PlayniteWebPlugin.Services;
using PlayniteWebPlugin.Services.Mqtt;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Controls;

namespace PlayniteWebPlugin
{
  public class WebPlugin : GenericPlugin
  {
    private static readonly ILogger logger = LogManager.GetLogger();

    private readonly List<MainMenuItem> mainMenuItems;

    private readonly List<SidebarItem> sidebarItems;
    private readonly JsonSerializerOptions jsonOptions;
    public static ISerializeObjects serializer { get; set; }
    public static IMqttClient client { get; set; }

    public static MqttSettings settings;

    public static IManageTopics topicManager { get; set; }

    public WebPlugin(IPlayniteAPI api) : base(api)
    {

      jsonOptions = new JsonSerializerOptions
      {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
      };
      serializer = new ObjectSerializer();
      client = new MqttFactory().CreateMqttClient();
      settings = new MqttSettings();
      topicManager = new TopicManager(client, settings);

      Properties = new GenericPluginProperties
      {
        HasSettings = false
      };

      sidebarItems = new List<SidebarItem>
      {
      };

      mainMenuItems = new List<MainMenuItem>
      {

      };
    }

    public GlobalProgressResult StartConnection(bool notifyCompletion = false)
    {
      if (client.IsConnected)
      {
        PlayniteApi.Notifications.Add(
            new NotificationMessage(Guid.NewGuid().ToString(), "Connection to MQTT underway", NotificationType.Error));
        throw new Exception("Connection to MQTT underway");
      }

      return PlayniteApi.Dialogs.ActivateGlobalProgress(
          args =>
          {
            args.CurrentProgressValue = -1;
            var optionsUnBuilt = new MqttClientOptionsBuilder().WithClientId(settings.ClientId)
                      .WithTcpServer(settings.ServerAddress, settings.Port)
                      .WithCredentials(settings.Username, settings.Password)
                      .WithCleanSession();

            if (settings.UseSecureConnection)
            {
              optionsUnBuilt = optionsUnBuilt.WithTls();
            }

            var options = optionsUnBuilt.Build();
            client.ApplicationMessageReceivedAsync += OnMessageReceived;
            client.ConnectAsync(options, args.CancelToken)
                      .ContinueWith(
                          t =>
                          {
                            if (t.Exception != null)
                            {
                              PlayniteApi.Dialogs.ShowErrorMessage(
                                        $"MQTT: {string.Join(",", t.Exception.InnerExceptions.Select(i => i.Message))}",
                                        "MQTT Error");
                            }
                            else
                            {
                              if (notifyCompletion && client.IsConnected)
                              {
                                PlayniteApi.Dialogs.ShowMessage("MQTT Connected");
                              }
                            }
                          },
                          args.CancelToken)
                      .Wait(args.CancelToken);
          },
          new GlobalProgressOptions($"Connection to MQTT ({settings.ServerAddress}:{settings.Port}) and initial publishing of library.", true));
    }

    private Task OnMessageReceived(MqttApplicationMessageReceivedEventArgs args)
    {
      logger.Debug($"Received MQTT Message: {args.ApplicationMessage.Topic} {args.ApplicationMessage.ConvertPayloadToString()}");
      try
      {
        if (topicManager.TryGetSubscribeTopic(SubscribeTopics.RequestLibraryPublish, out var requestLibraryPublishTopic))
        {
          if (args.ApplicationMessage.Topic == requestLibraryPublishTopic)
          {
            var games = PlayniteApi.Database.Games.ToList();
            return PublishGames(games);
          }
        }
      }
      catch (Exception e)
      {
        logger.Error(e, e.Message);
      }
      return Task.CompletedTask;
    }

    public Task StartDisconnect(bool notify = false)
    {
      var task = Task.CompletedTask;

      if (client.IsConnected)
      {
        if (topicManager.TryGetPublishTopic(PublishTopics.ConnectionSubTopic, out var connectionTopic) &&
            topicManager.TryGetPublishTopic(PublishTopics.SelectedGameStatusSubTopic, out var selectedGameStatusTopic))
        {
          task = client.PublishStringAsync(connectionTopic, "offline", retain: true)
              .ContinueWith(async t => await client.PublishStringAsync(selectedGameStatusTopic, "offline", retain: true));
        }

        task = task.ContinueWith(async r => await client.DisconnectAsync())
            .ContinueWith(
                t =>
                {
                  if (notify && !client.IsConnected)
                  {
                    PlayniteApi.Dialogs.ShowMessage("MQTT Disconnected");
                  }
                });
      }

      return task;
    }

    private Task ClientOnDisconnectedAsync(MqttClientDisconnectedEventArgs args)
    {
      return Task.CompletedTask;
    }

    private async Task ClientOnConnectedAsync(MqttClientConnectedEventArgs args)
    {
      logger.Debug("MQTT client connected");

      if (topicManager.TryGetPublishTopic(PublishTopics.ConnectionSubTopic, out var connectionTopic))
      {
        await client.PublishStringAsync(connectionTopic, "online", retain: true);
      }
      if (topicManager.TryGetSubscribeTopic(SubscribeTopics.RequestLibraryPublish, out var requestLibraryPublishTopic))
      {
        var mqttSubscribeOptions = new MqttFactory().CreateSubscribeOptionsBuilder().WithTopicFilter(f => f.WithTopic(requestLibraryPublishTopic)).Build();
        await client.SubscribeAsync(mqttSubscribeOptions, CancellationToken.None);
      }
    }

    private async Task PublishGames(IEnumerable<Game> games)
    {
      if (!games.Any())
      {
        logger.Debug("No games to publish.");
        return;
      }


      if (topicManager.TryGetSubscribeTopic(SubscribeTopics.RequestLibraryPublish, out var requestLibraryPublishTopic) && topicManager.TryGetPublishTopic(PublishTopics.GameSubTopic, out var publishGameTopic) && topicManager.TryGetPublishTopic(PublishTopics.Platform, out var publishGamePlatformTopic))
      {

        foreach (var platform in games.Where(game => game.Platforms != null).SelectMany(game => game.Platforms).Distinct())
        {
          logger.Debug($"Publishing game platform {platform.Name}.");
          await client.PublishStringAsync($"{publishGamePlatformTopic}/{platform.Id}", serializer.Serialize(platform), retain: false, qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce);
          if (settings.PublishCover)
          {
            await PublishFileAsync($"{publishGamePlatformTopic}/{platform.Id}/asset", platform.Cover, MqttQualityOfServiceLevel.AtLeastOnce, false);
          }
          if (settings.PublishBackground)
          {
            await PublishFileAsync($"{publishGamePlatformTopic}/{platform.Id}/asset", platform.Background, MqttQualityOfServiceLevel.AtLeastOnce, false);
          }
          await PublishFileAsync($"{publishGamePlatformTopic}/{platform.Id}/asset", platform.Icon, MqttQualityOfServiceLevel.AtLeastOnce, false);
        }

        foreach (var game in games)
        {
          logger.Debug($"Publishing game {game.Name}.");
          await client.PublishStringAsync($"{publishGameTopic}/{game.Id}", serializer.Serialize(game), retain: false, qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce);
          if (settings.PublishCover)
          {
            await PublishFileAsync($"{publishGameTopic}/{game.Id}/asset", game.CoverImage, MqttQualityOfServiceLevel.AtLeastOnce, false);
          }
          if (settings.PublishBackground)
          {
            await PublishFileAsync($"{publishGameTopic}/{game.Id}/asset", game.BackgroundImage, MqttQualityOfServiceLevel.AtLeastOnce, false);
          }
        }

        await client.PublishStringAsync($"{requestLibraryPublishTopic}/completed", "", retain: false, qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce);
      }
    }

    private async Task PublishFileAsync(string topic, string filePath, MqttQualityOfServiceLevel qualityOfServiceLevel, bool retain = false, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrEmpty(topic) || string.IsNullOrEmpty(filePath))
      {
        return;
      }

      var fullPath = PlayniteApi.Database.GetFullFilePath(filePath);
      var assetId = filePath.Split('\\').Last();
      if (!File.Exists(fullPath))
      {
        return;
      }

      using (var fileStream = File.OpenRead(fullPath))
      {
        var result = new byte[fileStream.Length];
        await fileStream.ReadAsync(result, 0, result.Length, cancellationToken);

        await client.PublishBinaryAsync(
            $"{topic}/{assetId}",
            result,
            retain: retain,
            qualityOfServiceLevel: qualityOfServiceLevel,
            cancellationToken: cancellationToken);
      }
    }



    #region Overrides of Plugin

    public override Guid Id { get; } = Guid.Parse("272c28c2-d920-45c4-8866-cf2bf63528f8");

    public override void OnLibraryUpdated(OnLibraryUpdatedEventArgs args)
    {

    }

    public override void Dispose()
    {
      base.Dispose();
    }

    public override void OnGameInstalled(OnGameInstalledEventArgs args)
    {
    }

    public override void OnGameStarted(OnGameStartedEventArgs args)
    {
    }

    public override void OnGameStarting(OnGameStartingEventArgs args)
    {
    }

    public override void OnGameStopped(OnGameStoppedEventArgs args)
    {
    }

    public override void OnGameUninstalled(OnGameUninstalledEventArgs args)
    {
    }

    public override void OnApplicationStarted(OnApplicationStartedEventArgs args)
    {
      client.ConnectedAsync += ClientOnConnectedAsync;
      client.DisconnectedAsync += ClientOnDisconnectedAsync;
      StartConnection();
    }

    public override void OnApplicationStopped(OnApplicationStoppedEventArgs args)
    {
      client.ConnectedAsync -= ClientOnConnectedAsync;
      client.DisconnectedAsync -= ClientOnDisconnectedAsync;
      StartDisconnect();
    }

    public override IEnumerable<SidebarItem> GetSidebarItems()
    {
      return sidebarItems;
    }

    public override IEnumerable<MainMenuItem> GetMainMenuItems(GetMainMenuItemsArgs args)
    {
      return mainMenuItems;
    }

    #endregion
  }
}
