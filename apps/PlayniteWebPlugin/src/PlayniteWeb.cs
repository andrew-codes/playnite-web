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
      settings = new PlayniteWebSettingsViewModel(this);
      IManageTopics topicManager = new TopicManager(settings.Settings);
      gamePublisher = new MqttGamePublisher(client, topicManager, api.Database);
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

    private void StartConnection(PlayniteWebSettings settings)
    {
      var options = new MqttPublisherOptions(settings.ClientId, settings.ServerAddress, settings.Port, settings.Username, settings.Password, Id.ToByteArray());
      gamePublisher.StartConnection(options);
    }

    private Task HandleLibraryRefreshed(Task incoming)
    {
      return incoming.ContinueWith(t => Task.WhenAll(gamePublisher.PublishLibrary())); ;
    }

    private void HandleGameUpdated(object sender, ItemUpdatedEventArgs<Game> e)
    {
      var updatedGamesData = e.UpdatedItems.Select(g => g.NewData);
      Task.WhenAll(gamePublisher.PublishGames(updatedGamesData));
    }

    private void HandleVerifySettings(object sender, PlayniteWebSettings e)
    {
      StartConnection(e);
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
      settings.OnVerifySettings += HandleVerifySettings;

      StartConnection(settings.Settings);

      libraryRefreshRequestReceived.Subscribe(e => libraryRefreshRequests.OnNext(Task.CompletedTask));
      libraryRefreshRequests.Subscribe(e => HandleLibraryRefreshed(e));

      gameUpdated.Subscribe(e => gameUpdates.OnNext(e.EventArgs));
      gameUpdates.Subscribe(e => HandleGameUpdated(this, e));
    }

    public override void OnApplicationStopped(OnApplicationStoppedEventArgs args)
    {
      settings.OnVerifySettings -= HandleVerifySettings;

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
