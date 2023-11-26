using MQTTnet;
using MQTTnet.Client;
using Playnite.SDK;
using Playnite.SDK.Events;
using Playnite.SDK.Models;
using Playnite.SDK.Plugins;
using PlayniteWeb.Services.Mqtt;
using PlayniteWeb.UI;
using System;
using System.Linq;
using System.Reactive;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Windows.Controls;

namespace PlayniteWeb
{
  public class PlayniteWeb : GenericPlugin
  {
    private readonly IPublishGamesToPlayniteWeb<IMqttClient> gamePublisher;
    private readonly Subject<Task> libraryRefreshRequests;
    private readonly Subject<ItemUpdatedEventArgs<Game>> gameUpdates;
    private IObservable<EventPattern<Task>> libraryRefreshRequestReceived;
    private IObservable<EventPattern<ItemUpdatedEventArgs<Game>>> gameUpdated;

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

      libraryRefreshRequestReceived = Observable.FromEventPattern<Task>(h => gamePublisher.LibraryRefreshRequest += h, h => gamePublisher.LibraryRefreshRequest -= h);
      libraryRefreshRequests = new Subject<Task>();
      libraryRefreshRequests.Throttle(TimeSpan.FromSeconds(settings.Settings.PublishingThrottle));

      gameUpdated = Observable.FromEventPattern<ItemUpdatedEventArgs<Game>>(h => PlayniteApi.Database.Games.ItemUpdated += h, h => PlayniteApi.Database.Games.ItemUpdated -= h);
      gameUpdates = new Subject<ItemUpdatedEventArgs<Game>>();
      gameUpdates.Throttle(TimeSpan.FromSeconds(settings.Settings.PublishingThrottle));
    }


    private Task LibraryRefreshed(Task incoming)
    {
      var games = PlayniteApi.Database.Games;
      return incoming.ContinueWith(t => gamePublisher.PublishLibrary(games));
    }

    private void Games_ItemUpdated(object sender, ItemUpdatedEventArgs<Game> e)
    {
      var updatedGamesData = e.UpdatedItems.Select(g => g.NewData);
      gamePublisher.PublishLibrary(updatedGamesData).Wait();
    }

    public override void OnLibraryUpdated(OnLibraryUpdatedEventArgs args)
    {
      libraryRefreshRequests.OnNext(Task.CompletedTask);
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
      var options = new MqttPublisherOptions(settings.Settings.ClientId, settings.Settings.ServerAddress, settings.Settings.Port, settings.Settings.Username, settings.Settings.Password, Id.ToByteArray());
      gamePublisher.StartConnection(options);

      libraryRefreshRequestReceived.Subscribe(e => libraryRefreshRequests.OnNext(Task.CompletedTask));
      libraryRefreshRequests.Subscribe(e => LibraryRefreshed(e));

      gameUpdated.Subscribe(e => gameUpdates.OnNext(e.EventArgs));
      gameUpdates.Subscribe(e => Games_ItemUpdated(this, e));
    }

    public override void OnApplicationStopped(OnApplicationStoppedEventArgs args)
    {
      libraryRefreshRequests.Dispose();
      gameUpdates.Dispose();
      gamePublisher.StartDisconnect().Wait();
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
