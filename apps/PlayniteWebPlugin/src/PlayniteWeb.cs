using MQTTnet;
using MQTTnet.Client;
using Playnite.SDK;
using Playnite.SDK.Events;
using Playnite.SDK.Models;
using Playnite.SDK.Plugins;
using PlayniteWeb.Services;
using PlayniteWeb.Services.Publishers;
using PlayniteWeb.Services.Publishers.Mqtt;
using PlayniteWeb.Services.Subscribers;
using PlayniteWeb.Services.Subscribers.Mqtt;
using PlayniteWeb.TopicManager;
using PlayniteWeb.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reactive;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Reflection;
using System.Threading.Tasks;
using System.Windows.Controls;

namespace PlayniteWeb
{
  public class PlayniteWeb : GenericPlugin
  {
    private readonly IConnectPublisher<IMqttClient> publisher;
    private readonly ISubscribeToPlayniteWeb subscriber;
    private readonly IObservable<EventPattern<ItemUpdatedEventArgs<Platform>>> platformUpdated;
    private readonly Subject<ItemUpdatedEventArgs<Platform>> platformUpdates;
    private readonly Subject<ItemUpdatedEventArgs<Game>> gameUpdates;
    private readonly IPublishToPlayniteWeb gamePublisher;
    private readonly IPublishToPlayniteWeb platformPublisher;
    private readonly IPublishToPlayniteWeb gameEntityPublisher;
    private readonly IPublishToPlayniteWeb gameEntityRemovalPublisher;
    private readonly IObservable<EventPattern<ItemUpdatedEventArgs<Game>>> gameUpdated;
    private readonly Subject<ItemUpdatedEventArgs<DatabaseObject>> otherEntityUpdates;
    private readonly IObservable<EventPattern<ItemUpdatedEventArgs<DatabaseObject>>> otherEntityUpdated;
    private readonly Subject<ItemCollectionChangedEventArgs<DatabaseObject>> collectionUpdates;
    private readonly IObservable<EventPattern<ItemCollectionChangedEventArgs<DatabaseObject>>> collectionUpdated;
    private readonly IEnumerable<MainMenuItem> mainMenuItems;
    private PlayniteWebSettingsViewModel settings { get; set; }
    private readonly IManageTopics topicManager;

    public override Guid Id { get; } = Guid.Parse("ec3439e3-51ee-43cb-9a8a-5d82cf45edac");

    public PlayniteWeb(IPlayniteAPI api) : base(api)
    {
      IMqttClient client = new MqttFactory().CreateMqttClient();
      settings = new PlayniteWebSettingsViewModel(this);
      topicManager = new TopicManager.TopicManager(settings.Settings);
      publisher = new MqttPublisher(client, topicManager);
      subscriber = new PlayniteWebSubscriber(client, topicManager);
      Properties = new GenericPluginProperties
      {
        HasSettings = true
      };
      var serializer = new ObjectSerializer();
      gamePublisher = new PublishGame((IMqttClient)publisher, topicManager, serializer, api.Database);
      platformPublisher = new PublishPlatform((IMqttClient)publisher, topicManager, serializer, api.Database);
      gameEntityPublisher = new PublishGameEntity((IMqttClient)publisher, topicManager, serializer, api.Database);
      gameEntityRemovalPublisher = new PublishGameEntityRemoval((IMqttClient)publisher, topicManager, serializer, api.Database);

      gameUpdates = new Subject<ItemUpdatedEventArgs<Game>>();
      gameUpdates.Throttle(TimeSpan.FromSeconds(settings.Settings.PublishingThrottle));
      gameUpdated = Observable.FromEventPattern<ItemUpdatedEventArgs<Game>>(h => PlayniteApi.Database.Games.ItemUpdated += h, h => PlayniteApi.Database.Games.ItemUpdated -= h);
      gameUpdated.Subscribe(e => gameUpdates.OnNext(e.EventArgs));

      platformUpdates = new Subject<ItemUpdatedEventArgs<Platform>>();
      platformUpdates.Throttle(TimeSpan.FromSeconds(settings.Settings.PublishingThrottle));
      platformUpdated = Observable.FromEventPattern<ItemUpdatedEventArgs<Platform>>(h => PlayniteApi.Database.Platforms.ItemUpdated += h, h => PlayniteApi.Database.Platforms.ItemUpdated -= h);
      platformUpdated.Subscribe(e => platformUpdates.OnNext(e.EventArgs));

      var handlers = new EventHandlers();

      otherEntityUpdates = new Subject<ItemUpdatedEventArgs<DatabaseObject>>();
      otherEntityUpdates.Throttle(TimeSpan.FromSeconds(settings.Settings.PublishingThrottle));
      otherEntityUpdated = Observable.FromEventPattern<ItemUpdatedEventArgs<DatabaseObject>>(h =>
      {
        PlayniteApi.Database.AgeRatings.ItemUpdated += handlers.RegisterItemUpdateHandler<AgeRating>(h);
        PlayniteApi.Database.Categories.ItemUpdated += handlers.RegisterItemUpdateHandler<Category>(h);
        PlayniteApi.Database.Companies.ItemUpdated += handlers.RegisterItemUpdateHandler<Company>(h);
        PlayniteApi.Database.CompletionStatuses.ItemUpdated += handlers.RegisterItemUpdateHandler<CompletionStatus>(h);
        PlayniteApi.Database.Features.ItemUpdated += handlers.RegisterItemUpdateHandler<GameFeature>(h);
        PlayniteApi.Database.Genres.ItemUpdated += handlers.RegisterItemUpdateHandler<Genre>(h);
        PlayniteApi.Database.Regions.ItemUpdated += handlers.RegisterItemUpdateHandler<Region>(h);
        PlayniteApi.Database.Series.ItemUpdated += handlers.RegisterItemUpdateHandler<Series>(h);
        PlayniteApi.Database.Sources.ItemUpdated += handlers.RegisterItemUpdateHandler<GameSource>(h);
        PlayniteApi.Database.Tags.ItemUpdated += handlers.RegisterItemUpdateHandler<Tag>(h);
      },
      h =>
      {
        PlayniteApi.Database.AgeRatings.ItemUpdated -= handlers.GetItemUpdateHandler<AgeRating>();
        PlayniteApi.Database.Categories.ItemUpdated -= handlers.GetItemUpdateHandler<Category>();
        PlayniteApi.Database.Companies.ItemUpdated -= handlers.GetItemUpdateHandler<Company>();
        PlayniteApi.Database.CompletionStatuses.ItemUpdated -= handlers.GetItemUpdateHandler<CompletionStatus>();
        PlayniteApi.Database.Features.ItemUpdated -= handlers.GetItemUpdateHandler<GameFeature>();
        PlayniteApi.Database.Genres.ItemUpdated -= handlers.GetItemUpdateHandler<Genre>();
        PlayniteApi.Database.Regions.ItemUpdated -= handlers.GetItemUpdateHandler<Region>();
        PlayniteApi.Database.Series.ItemUpdated -= handlers.GetItemUpdateHandler<Series>();
        PlayniteApi.Database.Tags.ItemUpdated -= handlers.GetItemUpdateHandler<Tag>();
      });
      otherEntityUpdated.Subscribe(e => otherEntityUpdates.OnNext(e.EventArgs));

      collectionUpdates = new Subject<ItemCollectionChangedEventArgs<DatabaseObject>>();
      collectionUpdates.Throttle(TimeSpan.FromSeconds(settings.Settings.PublishingThrottle));
      collectionUpdated = Observable.FromEventPattern<ItemCollectionChangedEventArgs<DatabaseObject>>(h =>
      {
        PlayniteApi.Database.AgeRatings.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<AgeRating>(h);
        PlayniteApi.Database.Categories.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<Category>(h);
        PlayniteApi.Database.Companies.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<Company>(h);
        PlayniteApi.Database.CompletionStatuses.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<CompletionStatus>(h);
        PlayniteApi.Database.Features.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<GameFeature>(h);
        PlayniteApi.Database.Games.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<Game>(h);
        PlayniteApi.Database.Genres.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<Genre>(h);
        PlayniteApi.Database.Platforms.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<Platform>(h);
        PlayniteApi.Database.Regions.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<Region>(h);
        PlayniteApi.Database.Series.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<Series>(h);
        PlayniteApi.Database.Sources.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<GameSource>(h);
        PlayniteApi.Database.Tags.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<Tag>(h);
      },
      h =>
      {
        PlayniteApi.Database.AgeRatings.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<AgeRating>();
        PlayniteApi.Database.Categories.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<Category>();
        PlayniteApi.Database.Companies.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<Company>();
        PlayniteApi.Database.CompletionStatuses.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<CompletionStatus>();
        PlayniteApi.Database.Features.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<GameFeature>();
        PlayniteApi.Database.Games.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<Game>();
        PlayniteApi.Database.Genres.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<Genre>();
        PlayniteApi.Database.Platforms.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<Platform>();
        PlayniteApi.Database.Regions.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<Region>();
        PlayniteApi.Database.Series.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<Series>();
        PlayniteApi.Database.Tags.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<Tag>();
      }
        );
      collectionUpdated.Subscribe(e => collectionUpdates.OnNext(e.EventArgs));

      mainMenuItems = new List<MainMenuItem>
            {
                new MainMenuItem
                {
                    Description = "Sync Library", MenuSection = "@Playnite Web", Action = SyncLibraryFromMenu
                },
            };
    }

    private void SyncLibraryFromMenu(MainMenuItemActionArgs args)
    {
     Task.WhenAll(SyncLibrary()).Wait();
    }

    private IEnumerable<Task> SyncLibrary()
    {
      var gamePublications = PlayniteApi.Database.Games.SelectMany(game => gamePublisher.Publish(game));
      var platformPublications = PlayniteApi.Database.Platforms.SelectMany(platform => platformPublisher.Publish(platform));

      IEnumerable<string> ignored = new List<string> {
        "Games", "Platforms", "ImportExclusions", "FilterPresets", "IsOpen"
      };
      var gameEntityProperties = typeof(IGameDatabase)
        .GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.GetProperty)
        .Where(propertyInfo => !ignored.Any(ignore => ignore == propertyInfo.Name));
      var gameEntities = gameEntityProperties
        .SelectMany(propertyInfo => (IEnumerable<DatabaseObject>)propertyInfo.GetValue(PlayniteApi.Database));
      var otherGameEntityPublications = gameEntities.SelectMany(entity => gameEntityPublisher.Publish(entity));


      return gamePublications.Concat(platformPublications).Concat(otherGameEntityPublications);      
    }

    public override void OnLibraryUpdated(OnLibraryUpdatedEventArgs args)
    {
    }

    public override void OnGameInstalled(OnGameInstalledEventArgs args)
    {
      var gameStatePublisher = new PublishGameState((IMqttClient)publisher, topicManager);
      gameStatePublisher.Publish(args.Game);
    }

    public override void OnGameStarted(OnGameStartedEventArgs args)
    {
      var gameStatePublisher = new PublishGameState((IMqttClient)publisher, topicManager, args.StartedProcessId);
      gameStatePublisher.Publish(args.Game);
    }

    public override void OnGameStarting(OnGameStartingEventArgs args)
    {
      var gameStatePublisher = new PublishGameState((IMqttClient)publisher, topicManager);
      gameStatePublisher.Publish(args.Game);
    }

    public override void OnGameStopped(OnGameStoppedEventArgs args)
    {
      var gameStatePublisher = new PublishGameState((IMqttClient)publisher, topicManager);
      gameStatePublisher.Publish(args.Game);
    }

    public override void OnGameUninstalled(OnGameUninstalledEventArgs args)
    {
      var gameStatePublisher = new PublishGameState((IMqttClient)publisher, topicManager);
      gameStatePublisher.Publish(args.Game);
    }

    public override void OnApplicationStopped(OnApplicationStoppedEventArgs args)
    {
      settings.OnVerifySettings -= HandleVerifySettings;

      subscriber.OnLibraryRequest -= Publisher_LibraryRefreshRequest;
      subscriber.OnStartGameRequest -= Subscriber_OnStartGameRequest;
      subscriber.OnInstallGameRequest -= Subscriber_OnInstallGameRequest;
      subscriber.OnUninstallGameRequest -= Subscriber_OnUninstallGameRequest;

      gameUpdates.Dispose();
      platformUpdates.Dispose();
      otherEntityUpdates.Dispose();
      collectionUpdates.Dispose();

      publisher.StartDisconnect().Wait();
    }

    public override void OnApplicationStarted(OnApplicationStartedEventArgs args)
    {
      settings.OnVerifySettings += HandleVerifySettings;

      StartConnection(settings.Settings);

      subscriber.OnLibraryRequest += Publisher_LibraryRefreshRequest;
      subscriber.OnStartGameRequest += Subscriber_OnStartGameRequest;
      subscriber.OnInstallGameRequest += Subscriber_OnInstallGameRequest;
      subscriber.OnUninstallGameRequest += Subscriber_OnUninstallGameRequest;


      gameUpdates.Subscribe(e => HandleGameUpdated(this, e));
      platformUpdates.Subscribe(e => HandlePlatformUpdated(this, e));
      otherEntityUpdates.Subscribe(e => HandleOtherGameEntitiesUpdated(this, e));
      collectionUpdates.Subscribe(e => HandleCollectionUpdate(this, e));
    }

    private void Subscriber_OnUninstallGameRequest(object sender, Guid e)
    {
      var game = PlayniteApi.Database.Games.First(g => g.Id == e);
      if (game.IsInstalled)
      {
        PlayniteApi.UninstallGame(e);
        var gameStatePublisher = new PublishGameState((IMqttClient)publisher, topicManager);
        gameStatePublisher.Publish(game);
      }
    }

    private void Subscriber_OnInstallGameRequest(object sender, Guid e)
    {
      var game = PlayniteApi.Database.Games.First(g => g.Id == e);
      if (!game.IsInstalled)
      {
        PlayniteApi.InstallGame(e);
        var gameStatePublisher = new PublishGameState((IMqttClient)publisher, topicManager);
        gameStatePublisher.Publish(game);
      }
    }

    private void HandleVerifySettings(object sender, PlayniteWebSettings e)
    {
      StartConnection(e);
    }

    private void StartConnection(PlayniteWebSettings settings)
    {
      var options = new MqttPublisherOptions(settings.ClientId, settings.ServerAddress, settings.Port, settings.Username, settings.Password, Id.ToByteArray());
      publisher.StartConnection(options);
    }

    private void Subscriber_OnStartGameRequest(object sender, Guid gameId)
    {
      PlayniteApi.StartGame(gameId);
    }

    private void Publisher_LibraryRefreshRequest(object sender, Task e)
    {
      Task.WhenAll(SyncLibrary()).ContinueWith((t) => e);
    }

    private void HandleGameUpdated(object sender, ItemUpdatedEventArgs<Game> e)
    {
      var updatedGamesData = e.UpdatedItems.Select(g => g.NewData);
      Task.WhenAll(updatedGamesData.SelectMany(item => gamePublisher.Publish(item))
     );
    }

    private void HandlePlatformUpdated(object sender, ItemUpdatedEventArgs<Platform> e)
    {
      var updatedPlatforms = e.UpdatedItems.Select(g => g.NewData);
      Task.WhenAll(updatedPlatforms.SelectMany(item => platformPublisher.Publish(item))
     );
    }

    private void HandleOtherGameEntitiesUpdated(object sender, ItemUpdatedEventArgs<DatabaseObject> e)
    {
      var updates = e.UpdatedItems.Select(g => g.NewData);
      Task.WhenAll(updates.SelectMany(item => gameEntityPublisher.Publish(item))
     );
    }

    private void HandleCollectionUpdate(PlayniteWeb playniteWeb, ItemCollectionChangedEventArgs<DatabaseObject> e)
    {
      Task.WhenAll(e.AddedItems.SelectMany(item =>
      {
        if (item.GetType() == typeof(Game))
        {
          return gameEntityPublisher.Publish(item);
        }
        if (item.GetType() == typeof(Platform))
        {
          return platformPublisher.Publish(item);
        }

        return gameEntityPublisher.Publish(item);
      }));

      Task.WhenAll(e.RemovedItems.SelectMany(item => gameEntityRemovalPublisher.Publish(item)));
    }

    public override ISettings GetSettings(bool firstRunSettings)
    {
      return settings;
    }

    public override UserControl GetSettingsView(bool firstRunSettings)
    {
      return new PlayniteWebSettingsView();
    }

    public override IEnumerable<MainMenuItem> GetMainMenuItems(GetMainMenuItemsArgs args)
    {
      return mainMenuItems.AsEnumerable();
    }
  }
}
