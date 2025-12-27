using MQTTnet;
using Playnite.SDK;
using Playnite.SDK.Data;
using Playnite.SDK.Events;
using Playnite.SDK.Models;
using Playnite.SDK.Plugins;
using PlayniteWebMqtt.Models;
using PlayniteWebMqtt.Services;
using PlayniteWebMqtt.Services.Mqtt;
using PlayniteWebMqtt.Services.Subscribers;
using PlayniteWebMqtt.Services.Subscribers.Mqtt;
using PlayniteWebMqtt.TopicManager;
using PlayniteWebMqtt.UI;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reactive.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows.Controls;

namespace PlayniteWebMqtt
{
  public class PlayniteWebMqtt : GenericPlugin
  {
    private readonly MqttClient mqtt;
    private readonly ISubscribeToPlayniteWeb subscriber;
    private readonly ISerializeObjects serializer;
    private readonly IEnumerable<MainMenuItem> mainMenuItems;
    private PlayniteWebMqttSettingsViewModel settings { get; set; }
    private readonly IManageTopics topicManager;
    private readonly ILogger logger = LogManager.GetLogger();
    private readonly Regex pcExpression = new Regex("Windows.*");
    private readonly string _version;

    public override Guid Id { get; } = Guid.Parse("8c8e0788-7c52-426a-a479-fcf0836ea64a");

    public PlayniteWebMqtt(IPlayniteAPI api) : base(api)
    {
#if DEBUG
            _version = "0.0.1";
#else
      var extensionInfoYaml = System.IO.File.ReadAllText(Path.Combine(api.Paths.ExtensionsDataPath, "..", "Extensions", $"PlayniteWebMqtt_{this.Id}", "extension.yaml"));
      var extension = Serialization.FromYaml<Dictionary<string, string>>(extensionInfoYaml);
      _version = extension["Version"];
#endif

      settings = new PlayniteWebMqttSettingsViewModel(this);
      topicManager = new TopicManager.TopicManager(settings.Settings);
      serializer = new ObjectSerializer();

      mqtt = new MqttClient(new MqttFactory().CreateMqttClient(), topicManager, _version, settings, Id, serializer);

      var deserializer = new ObjectDeserializer();
      subscriber = new PlayniteWebSubscriber(mqtt, topicManager, deserializer, api, settings.Settings.DeviceId);
      Properties = new GenericPluginProperties
      {
        HasSettings = true
      };
     mainMenuItems = new List<MainMenuItem>();
    }

    public override void OnLibraryUpdated(OnLibraryUpdatedEventArgs args)
    {
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

    public override void OnApplicationStopped(OnApplicationStoppedEventArgs args)
    {
      settings.OnVerifySettings -= HandleVerifySettings;

      subscriber.OnStartRelease -= Subscriber_OnStartRelease;
      subscriber.OnInstallRelease -= Subscriber_OnInstallRelease;
      subscriber.OnUninstallRelease -= Subscriber_OnUninstallRelease;
      subscriber.OnStopRelease -= Subscriber_OnStopRelease;
      subscriber.OnRestartRelease -= Subscriber_OnRestartRelease;
    }

    private void Subscriber_OnRestartRelease(object sender, ReleasePlatform e)
    {
      this.Subscriber_OnStopRelease(sender, e);
      Task.Delay(3000).ContinueWith(t => this.Subscriber_OnStartRelease(sender, e));
    }

    private void Subscriber_OnStopRelease(object sender, ReleasePlatform e)
    {
      if (!canRunPlaynite(e.Platform))
      {
        logger.Debug($"Platform {e.Platform.Name} is not a PC platform.");
        return;
      }

      try
      {

                var processesWithPath = Process.GetProcesses().Select(p =>
                {
                    try
                    {
                        string exePath = p.MainModule?.FileName;
                        return new { Process = p, Path = exePath };
                    }
                    catch
                    {
                        return null;
                    }
                }).Where(x => x != null && x.Path != null);
                var gameProcess = processesWithPath
                
                .Where(x => string.Equals(
                    Path.GetDirectoryName(x.Path),
                    e.Game.InstallDirectory,
                    StringComparison.OrdinalIgnoreCase))
                .Select(x => x.Process)
                .FirstOrDefault();
                if (gameProcess != null)
                {

                    gameProcess.Kill();
                } else
                {
                    processesWithPath.FirstOrDefault(x => x.Path.Contains("steam"))?.Process.Kill();
                }
                
      }
      catch (Exception ex)
      {
        logger.Error(ex, $"Error occurred in Subscriber_OnStopRelease for Game ID {e.Game.Id}.");
        var process = Process.GetProcessesByName(e.Game.Name).FirstOrDefault();
        if (process == null)
        {
          process = Process.GetProcesses().Where(p => p.MainWindowTitle.Contains(e.Game.Name)).FirstOrDefault();

          if (process == null) { return; }
        }

        process.Kill();
      }
    }

    public override void OnApplicationStarted(OnApplicationStartedEventArgs args)
    {
      settings.OnVerifySettings += HandleVerifySettings;
      try
      {
        StartConnection(settings.Settings);
      }
      catch (Exception ex)
      {
        logger.Error(ex, "Error occurred while starting MQTT connection.");
        PlayniteApi.Notifications.Add(new NotificationMessage(
          "PlayniteWebMqttConnectionError",
          $"Playnite Web (MQTT): Failed to establish connection. {ex.Message}",
          NotificationType.Error
        ));
      }

      subscriber.OnStartRelease += Subscriber_OnStartRelease;
      subscriber.OnInstallRelease += Subscriber_OnInstallRelease;
      subscriber.OnUninstallRelease += Subscriber_OnUninstallRelease;
      subscriber.OnStopRelease += Subscriber_OnStopRelease;
      subscriber.OnRestartRelease += Subscriber_OnRestartRelease;
    }

    private void Subscriber_OnUninstallRelease(object sender, ReleasePlatform e)
    {
      try
      {
        if (!canRunPlaynite(e.Platform) || !e.Game.IsInstalled)
        {
          logger.Debug($"Platform {e.Platform.Name} is not a PC platform or game is not installed.");
          return;
        }

        PlayniteApi.UninstallGame(e.Game.Id);
      }
      catch (Exception ex)
      {
        logger.Error(ex, $"Error occurred in Subscriber_OnUninstallGameRequest for Game ID {e}.");

      }
    }


    private void Subscriber_OnInstallRelease(object sender, ReleasePlatform e)
    {
      try
      {
        if (!canRunPlaynite(e.Platform) || e.Game.IsInstalled)
        {
          logger.Debug($"Platform {e.Platform.Name} is not a PC platform or game is already installed.");
          return;
        }

        PlayniteApi.InstallGame(e.Game.Id);
      }
      catch (Exception ex)
      {
        logger.Error(ex, $"Error occurred in Subscriber_OnInstallGameRequest for Game ID {e}.");

      }
    }

    private void Subscriber_OnStartRelease(object sender, ReleasePlatform release)
    {
      if (!canRunPlaynite(release.Platform))
      {
        logger.Debug($"Platform {release.Platform.Name} is not a PC platform.");
        return;
      }

      if (!release.Game.IsInstalled)
      {
        logger.Debug($"Game {release.Game.Name} is not installed. Installing instead of starting.");
        PlayniteApi.InstallGame(release.Game.Id);

        return;
      }

      PlayniteApi.StartGame(release.Game.Id);
    }

    private bool canRunPlaynite(Platform platform)
    {
      return pcExpression.IsMatch(platform.Name);
    }

    private void HandleVerifySettings(object sender, PlayniteWebMqttSettings e)
    {
      StartConnection(e);
    }

    private void StartConnection(PlayniteWebMqttSettings settings)
    {
      if (!string.IsNullOrEmpty(settings.DeviceId) && !string.IsNullOrWhiteSpace(settings.DeviceId))
      {
        var options = new MqttPublisherOptions(settings.ClientId, settings.ServerAddress, settings.Port, settings.Username, settings.Password, Id.ToByteArray(), PlayniteApi);
        mqtt.StartConnection(options);
      }
    }

    public override ISettings GetSettings(bool firstRunSettings)
    {
      return settings;
    }

    public override UserControl GetSettingsView(bool firstRunSettings)
    {
      return new PlayniteWebMqttSettingsView();
    }

    public override IEnumerable<MainMenuItem> GetMainMenuItems(GetMainMenuItemsArgs args)
    {
      return mainMenuItems.AsEnumerable();
    }
  }
}
