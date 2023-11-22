using MQTTnet;
using MQTTnet.Client;
using Playnite.SDK;
using Playnite.SDK.Events;
using Playnite.SDK.Plugins;
using PlayniteWeb.Services.Mqtt;
using PlayniteWeb.UI;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Controls;

namespace PlayniteWeb
{
  public class PlayniteWeb : GenericPlugin
  {
    private IPublishGamesToPlayniteWeb<IMqttClient> gamePublisher;

    private PlayniteWebSettingsViewModel settings { get; set; }

    public override Guid Id { get; } = Guid.Parse("ec3439e3-51ee-43cb-9a8a-5d82cf45edac");

    public PlayniteWeb(IPlayniteAPI api) : base(api)
    {
      IMqttClient client = new MqttFactory().CreateMqttClient();
      IManageTopics topicManager = new TopicManager(settings.Settings);
      gamePublisher = new MqttGamePublisher(client, topicManager, api.Database);
      settings = new PlayniteWebSettingsViewModel(this, gamePublisher);
      Properties = new GenericPluginProperties
      {
        HasSettings = true
      };
    }

    public override void OnGameInstalled(OnGameInstalledEventArgs args)
    {
      // Add code to be executed when game is finished installing.
    }

    public override void OnGameStarted(OnGameStartedEventArgs args)
    {
      // Add code to be executed when game is started running.
    }

    public override void OnGameStarting(OnGameStartingEventArgs args)
    {
      // Add code to be executed when game is preparing to be started.
    }

    public override void OnGameStopped(OnGameStoppedEventArgs args)
    {
      // Add code to be executed when game is preparing to be started.
    }

    public override void OnGameUninstalled(OnGameUninstalledEventArgs args)
    {
      // Add code to be executed when game is uninstalled.
    }

    public override void OnApplicationStarted(OnApplicationStartedEventArgs args)
    {
      // Add code to be executed when Playnite is initialized.
      gamePublisher.LibraryRefreshRequest += RefreshLibrary;

      var options = new MqttPublisherOptions(settings.Settings.ClientId, settings.Settings.ServerAddress, settings.Settings.Port, settings.Settings.Username, settings.Settings.Password, Id.ToByteArray());
      gamePublisher.StartConnection(options);

      PlayniteApi.Database.Games.ItemUpdated += Games_ItemUpdated;
    }

    private void Games_ItemUpdated(object sender, ItemUpdatedEventArgs<Playnite.SDK.Models.Game> e)
    {
      var updatedGamesData = e.UpdatedItems.Select(g => g.NewData);
      gamePublisher.PublishLibrary(updatedGamesData).Wait();
    }

    public override void OnApplicationStopped(OnApplicationStoppedEventArgs args)
    {
      gamePublisher.LibraryRefreshRequest -= RefreshLibrary;
      PlayniteApi.Database.Games.ItemUpdated -= Games_ItemUpdated;
      gamePublisher.StartDisconnect().Wait();
    }

    private Task RefreshLibrary()
    {
       var games = PlayniteApi.Database.Games;
      return gamePublisher.PublishLibrary(games);
    }

    public override void OnLibraryUpdated(OnLibraryUpdatedEventArgs args)
    {
      var games = PlayniteApi.Database.Games;
      gamePublisher.PublishLibrary(games).Wait();
    }

    public override ISettings GetSettings(bool firstRunSettings)
    {
      return settings;
    }

    public override UserControl GetSettingsView(bool firstRunSettings)
    {
      return new PlayniteWebSettingsView();
    }
  }
}
