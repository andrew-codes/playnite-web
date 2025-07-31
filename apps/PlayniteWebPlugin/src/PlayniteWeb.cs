using GraphQL;
using GraphQL.Client.Http;
using GraphQL.Client.Serializer.Newtonsoft;
using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Protocol;
using Newtonsoft.Json.Linq;
using Playnite.SDK;
using Playnite.SDK.Data;
using Playnite.SDK.Events;
using Playnite.SDK.Models;
using Playnite.SDK.Plugins;
using PlayniteWeb.Models;
using PlayniteWeb.Services;
using PlayniteWeb.Services.Publishers;
using PlayniteWeb.Services.Publishers.Mqtt;
using PlayniteWeb.Services.Publishers.WebSocket;
using PlayniteWeb.Services.Subscribers;
using PlayniteWeb.Services.Subscribers.Mqtt;
using PlayniteWeb.Services.Updaters;
using PlayniteWeb.TopicManager;
using PlayniteWeb.UI;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.WebSockets;
using System.Reactive;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Controls;

namespace PlayniteWeb
{
  public class PlayniteWeb : GenericPlugin
  {
    private readonly ISubscribeToPlayniteWeb subscriber;
    private readonly IObservable<EventPattern<ItemUpdatedEventArgs<Platform>>> platformUpdated;
    private readonly Subject<ItemUpdatedEventArgs<Platform>> platformUpdates;
    private PublishLibraryGraphQL libraryPublisher;
    private readonly Subject<ItemUpdatedEventArgs<Playnite.SDK.Models.Game>> gameUpdates;
    private readonly ISerializeObjects serializer;
    private readonly IPublishToPlayniteWeb gamePublisher;
    private readonly IPublishToPlayniteWeb playlistPublisher;
    private readonly IPublishToPlayniteWeb releasePublisher;
    private readonly IPublishToPlayniteWeb platformPublisher;
    private readonly IPublishToPlayniteWeb gameEntityPublisher;
    private readonly IPublishToPlayniteWeb gameEntityRemovalPublisher;
    private readonly IObservable<EventPattern<ItemUpdatedEventArgs<Playnite.SDK.Models.Game>>> gameUpdated;
    private readonly Subject<ItemUpdatedEventArgs<DatabaseObject>> otherEntityUpdates;
    private readonly IObservable<EventPattern<ItemUpdatedEventArgs<DatabaseObject>>> otherEntityUpdated;
    private readonly Subject<ItemCollectionChangedEventArgs<DatabaseObject>> collectionUpdates;
    private readonly IObservable<EventPattern<ItemCollectionChangedEventArgs<DatabaseObject>>> collectionUpdated;
    private readonly IEnumerable<MainMenuItem> mainMenuItems;
    private PlayniteWebSettingsViewModel settings { get; set; }
    private readonly IManageTopics topicManager;
    private readonly ILogger logger = LogManager.GetLogger();
    private readonly Regex pcExpression = new Regex("Windows.*");
    private readonly IEnumerable<Platform> pcPlatforms;
    private readonly string _version;
    private readonly EntityUpdater entityUpdater;
    private readonly GameSource emulatorSource = new GameSource("Emulator");
    private GraphQLHttpClient gql;
    private readonly int publishingThrottle = 3;

    public override Guid Id { get; } = Guid.Parse("ec3439e3-51ee-43cb-9a8a-5d82cf45edac");

    public PlayniteWeb(IPlayniteAPI api) : base(api)
    {
      pcPlatforms = PlayniteApi.Database.Platforms.Where(p => pcExpression.IsMatch(p.Name));
      using (MD5 md5 = MD5.Create())
      {
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(emulatorSource.Name));
        emulatorSource.Id = new Guid(hash);
      }
#if DEBUG
      _version = "0.0.1";
#else
      var extensionInfoYaml = System.IO.File.ReadAllText(Path.Combine(api.Paths.ExtensionsDataPath, "..", "Extensions", $"PlayniteWeb_{this.Id}", "extension.yaml"));
      var extension = Serialization.FromYaml<Dictionary<string, string>>(extensionInfoYaml);
      _version = extension["Version"];
#endif

      entityUpdater = new EntityUpdater(api);
     

      settings = new PlayniteWebSettingsViewModel(this, api.Database);
      topicManager = new TopicManager.TopicManager(settings.Settings);
      serializer = new ObjectSerializer();

      var deserializer = new ObjectDeserializer();
      //subscriber = new PlayniteWebSubscriber(mqtt, topicManager, deserializer, api, settings.Settings.DeviceId);
      Properties = new GenericPluginProperties
      {
        HasSettings = true
      };
            //releasePublisher = new PublishReleaseOverWebSockets(webSocket, topicManager, serializer, api.Database, settings.Settings.DeviceName);
            //gamePublisher = new PublishGame(mqtt, topicManager, serializer, releasePublisher, settings.Settings.DeviceId);
            //playlistPublisher = new PublishPlaylist(mqtt, topicManager, serializer, api.Database, settings.Settings.DeviceId);
            //platformPublisher = new PublishPlatform(mqtt, topicManager, serializer, api.Database, settings.Settings.DeviceId);
            //gameEntityPublisher = new PublishGameEntity(mqtt, topicManager, serializer, settings.Settings.DeviceId);
            //gameEntityRemovalPublisher = new PublishGameEntityRemoval(mqtt, topicManager, serializer, api.Database, settings.Settings.DeviceId);

            gameUpdates = new Subject<ItemUpdatedEventArgs<Playnite.SDK.Models.Game>>();
      gameUpdates.Throttle(TimeSpan.FromSeconds(publishingThrottle));
      gameUpdated = Observable.FromEventPattern<ItemUpdatedEventArgs<Playnite.SDK.Models.Game>>(h => PlayniteApi.Database.Games.ItemUpdated += h, h => PlayniteApi.Database.Games.ItemUpdated -= h);
      gameUpdated.Subscribe(e => gameUpdates.OnNext(e.EventArgs));

      platformUpdates = new Subject<ItemUpdatedEventArgs<Platform>>();
      platformUpdates.Throttle(TimeSpan.FromSeconds(publishingThrottle));
      platformUpdated = Observable.FromEventPattern<ItemUpdatedEventArgs<Platform>>(h => PlayniteApi.Database.Platforms.ItemUpdated += h, h => PlayniteApi.Database.Platforms.ItemUpdated -= h);
      platformUpdated.Subscribe(e => platformUpdates.OnNext(e.EventArgs));

      var handlers = new EventHandlers();

      otherEntityUpdates = new Subject<ItemUpdatedEventArgs<DatabaseObject>>();
      otherEntityUpdates.Throttle(TimeSpan.FromSeconds(publishingThrottle));
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
        PlayniteApi.Database.Sources.ItemUpdated -= handlers.GetItemUpdateHandler<GameSource>();
        PlayniteApi.Database.Tags.ItemUpdated -= handlers.GetItemUpdateHandler<Tag>();
      });
      otherEntityUpdated.Subscribe(e => otherEntityUpdates.OnNext(e.EventArgs));

      collectionUpdates = new Subject<ItemCollectionChangedEventArgs<DatabaseObject>>();
      collectionUpdates.Throttle(TimeSpan.FromSeconds(publishingThrottle));
      collectionUpdated = Observable.FromEventPattern<ItemCollectionChangedEventArgs<DatabaseObject>>(h =>
      {
        PlayniteApi.Database.AgeRatings.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<AgeRating>(h);
        PlayniteApi.Database.Categories.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<Category>(h);
        PlayniteApi.Database.Companies.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<Company>(h);
        PlayniteApi.Database.CompletionStatuses.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<CompletionStatus>(h);
        PlayniteApi.Database.Features.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<GameFeature>(h);
        PlayniteApi.Database.Games.ItemCollectionChanged += handlers.RegisterCollectionUpdateHandler<Playnite.SDK.Models.Game>(h);
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
        PlayniteApi.Database.Games.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<Playnite.SDK.Models.Game>();
        PlayniteApi.Database.Genres.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<Genre>();
        PlayniteApi.Database.Platforms.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<Platform>();
        PlayniteApi.Database.Regions.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<Region>();
        PlayniteApi.Database.Series.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<Series>();
        PlayniteApi.Database.Sources.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<GameSource>();
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
      logger.Info("Syncing library with Playnite Web.");
      var tasks = SyncLibrary().ToArray();
      Task.WhenAll(tasks).Wait();
      logger.Debug($"Total published update messages: {tasks.Length}");
      logger.Info("Finished syncing library with Playnite Web.");
    }

    private IEnumerable<Task> SyncLibrary()
    {
      //foreach(var task in libraryPublisher.Publish())
      //{
      //    yield return task;
      //}
      try
      {
        if (libraryPublisher != null)
        {
          libraryPublisher.Publish();
        }
      } catch(Exception e)
      {

      }
      yield return Task.CompletedTask;
      //var invalidPlayniteGames = PlayniteApi.Database.Games.Where(pg => string.IsNullOrEmpty(pg.Name) || string.IsNullOrWhiteSpace(pg.Name)).ToList();
      //foreach (var playniteGame in invalidPlayniteGames)
      //{
      //  logger.Warn($"Found game with no name; therefore it cannot be grouped into Games and Releases. Check the Playnite Game with ID {playniteGame.Id}. This game will not be published to Playnite Web.");
      //}


      //var categories = PlayniteApi.Database.Categories.ToList();
      //logger.Info($"Publishing a total of {categories.Count()} categories.");
      //foreach (var task in categories.SelectMany(entity => gameEntityPublisher.Publish(entity)))
      //{
      //  yield return task;
      //}

      //var companies = PlayniteApi.Database.Companies.ToList();
      //logger.Info($"Publishing a total of {companies.Count()} companies.");
      //foreach (var task in companies.SelectMany(entity => gameEntityPublisher.Publish(entity)))
      //{
      //  yield return task;
      //}

      //var emulators = PlayniteApi.Database.Emulators.ToList();
      //logger.Info($"Publishing a total of {emulators.Count()} emulators.");
      //foreach (var task in emulators.SelectMany(entity => gameEntityPublisher.Publish(entity)))
      //{
      //  yield return task;
      //}

      //var ageRatings = PlayniteApi.Database.AgeRatings.ToList();
      //logger.Info($"Publishing a total of {ageRatings.Count()} age ratings.");
      //foreach (var task in ageRatings.SelectMany(entity => gameEntityPublisher.Publish(entity)))
      //{
      //  yield return task;
      //}

      //var genres = PlayniteApi.Database.Genres.ToList();
      //logger.Info($"Publishing a total of {genres.Count()} genres.");
      //foreach (var task in genres.SelectMany(entity => gameEntityPublisher.Publish(entity)))
      //{
      //  yield return task;
      //}

      //var regions = PlayniteApi.Database.Regions.ToList();
      //logger.Info($"Publishing a total of {regions.Count()} regions.");
      //foreach (var task in regions.SelectMany(entity => gameEntityPublisher.Publish(entity)))
      //{
      //  yield return task;
      //}

      //var series = PlayniteApi.Database.Series.ToList();
      //logger.Info($"Publishing a total of {series.Count()} series.");
      //foreach (var task in series.SelectMany(entity => gameEntityPublisher.Publish(entity)))
      //{
      //  yield return task;
      //}

      //var validPlayniteGamesByName = PlayniteApi.Database.Games.Where(pg => !string.IsNullOrEmpty(pg.Name) && !string.IsNullOrWhiteSpace(pg.Name)).GroupBy(pg => pg.Name);
      //var allGames = validPlayniteGamesByName.Select(groupedByName => new Models.Game(groupedByName, pcPlatforms, emulatorSource)).Where(g => !g.Id.Equals(Guid.Empty)).ToList();
      //logger.Info($"Publishing a total of {allGames.Count()} Playnite Web Games.");
      //logger.Info($"Publshing a total of {allGames.SelectMany(game => game.Releases).Count()} Playnite Web Releases.");
      //foreach (var task in allGames.SelectMany(game => gamePublisher.Publish(game)))
      //{
      //  yield return task;
      //}


      //var playlists = PlayniteApi.Database.Tags
      //  .Where(tag => Regex.IsMatch(tag.Name, "^playlist-", RegexOptions.IgnoreCase))
      //  .Select(tag => new Playlist(tag.Name.Substring(9), allGames.Where(game => game.Releases.Any(release => release.Tags?.Any(releaseTag => releaseTag.Id == tag.Id) ?? false)))
      //  ).ToList();
      //logger.Info($"Publishing a total of {playlists.Count()} playlists.");
      //foreach (var task in playlists.SelectMany(playlist => playlistPublisher.Publish(playlist)))
      //{
      //  yield return task;
      //}
    }

    private Release ReleaseFromPlayniteGame(Playnite.SDK.Models.Game game)
    {
      var g = GameFromRelease(game);
      var release = g.Releases.FirstOrDefault(r => r.Id == game.Id);
      if (release == null)
      {
        logger.Debug($"Release not found for Game {game.Name} with ID {game.Id}.");
      }

      return release;
    }

    private Models.Game GameFromRelease(Playnite.SDK.Models.Game game)
    {
      var games = PlayniteApi.Database.Games.Where(g => g.Name == game.Name).ToList();
      return new Models.Game(games, pcPlatforms, emulatorSource);
    }

    public override void OnLibraryUpdated(OnLibraryUpdatedEventArgs args)
    {
    }

    public override void OnGameInstalled(OnGameInstalledEventArgs args)
    {
      var release = ReleaseFromPlayniteGame(args.Game);
      //var gameStatePublisher = new PublishGameState(GameState.installed, (IMqttClient)mqtt, topicManager, serializer);
      //Task.WaitAll(gameStatePublisher.Publish(release).ToArray());
    }

    public override void OnGameStarted(OnGameStartedEventArgs args)
    {
      var release = ReleaseFromPlayniteGame(args.Game);
      release.ProcessId = args.StartedProcessId;
      //var gameStatePublisher = new PublishGameState(GameState.running, (IMqttClient)mqtt, topicManager, serializer);
      //Task.WaitAll(gameStatePublisher.Publish(release).ToArray());
    }

    public override void OnGameStarting(OnGameStartingEventArgs args)
    {
      var release = ReleaseFromPlayniteGame(args.Game);
      //var gameStatePublisher = new PublishGameState(GameState.launching, (IMqttClient)mqtt, topicManager, serializer);
      //Task.WaitAll(gameStatePublisher.Publish(release).ToArray());
    }

    public override void OnGameStopped(OnGameStoppedEventArgs args)
    {
      var release = ReleaseFromPlayniteGame(args.Game);
      //var gameStatePublisher = new PublishGameState(GameState.installed, (IMqttClient)mqtt, topicManager, serializer);
      //Task.WaitAll(gameStatePublisher.Publish(release).ToArray());
    }

    public override void OnGameUninstalled(OnGameUninstalledEventArgs args)
    {
      var release = ReleaseFromPlayniteGame(args.Game);
      //var gameStatePublisher = new PublishGameState(GameState.uninstalled, (IMqttClient)mqtt, topicManager, serializer);
      //Task.WaitAll(gameStatePublisher.Publish(release).ToArray());
    }

    public override void OnApplicationStopped(OnApplicationStoppedEventArgs args)
    {
      settings.OnVerifySettings -= HandleVerifySettings;

      //subscriber.OnUpdateLibrary -= Publisher_LibraryRefreshRequest;
      //subscriber.OnStartRelease -= Subscriber_OnStartRelease;
      //subscriber.OnInstallRelease -= Subscriber_OnInstallRelease;
      //subscriber.OnUninstallRelease -= Subscriber_OnUninstallRelease;
      //subscriber.OnStopRelease -= Subscriber_OnStopRelease;
      //subscriber.OnRestartRelease -= Subscriber_OnRestartRelease;
      //subscriber.OnUpdateEntity -= Subscriber_OnUpdateEntity;

      //gameUpdates.Dispose();
      //platformUpdates.Dispose();
      //otherEntityUpdates.Dispose();
      //collectionUpdates.Dispose();

    }

    private void Subscriber_OnRestartRelease(object sender, Release e)
    {
      this.Subscriber_OnStopRelease(sender, e);
      Task.Delay(3000).ContinueWith(t => this.Subscriber_OnStartRelease(sender, e));
    }

    private void Subscriber_OnStopRelease(object sender, Release e)
    {
      if (!canRunPlaynite(e.Platform))
      {
        logger.Debug($"Platform {e.Platform.Name} is not a PC platform.");
        return;
      }

      if (e.RunState != RunState.Running)
      {
        logger.Debug($"Game {e.Name} is not running.");
        return;
      }

      try
      {
        var gameProcess = Process.GetProcessById(e.ProcessId.Value);
        gameProcess.Kill();
      }
      catch (Exception ex)
      {
        logger.Error(ex, $"Error occurred in Subscriber_OnStopRelease for Game ID {e.Id}.");
        var process = Process.GetProcessesByName(e.Name).FirstOrDefault();
        if (process == null)
        {
          process = Process.GetProcesses().Where(p => p.MainWindowTitle.Contains(e.Name)).FirstOrDefault();

          if (process == null) { return; }
        }

        process.Kill();
      }
    }

    public override void OnApplicationStarted(OnApplicationStartedEventArgs args)
    {
      settings.OnVerifySettings += HandleVerifySettings;
      StartConnection(settings.Settings);

      //subscriber.OnUpdateLibrary += Publisher_LibraryRefreshRequest;
      //subscriber.OnStartRelease += Subscriber_OnStartRelease;
      //subscriber.OnInstallRelease += Subscriber_OnInstallRelease;
      //subscriber.OnUninstallRelease += Subscriber_OnUninstallRelease;
      //subscriber.OnStopRelease += Subscriber_OnStopRelease;
      //subscriber.OnRestartRelease += Subscriber_OnRestartRelease;
      //subscriber.OnUpdateEntity += Subscriber_OnUpdateEntity;

      //gameUpdates.Subscribe(e => HandleGameUpdated(this, e));
      //platformUpdates.Subscribe(e => HandlePlatformUpdated(this, e));
      //otherEntityUpdates.Subscribe(e => HandleOtherGameEntitiesUpdated(this, e));
      //collectionUpdates.Subscribe(e => HandleCollectionUpdate(this, e));
    }

    private void Subscriber_OnUpdateEntity(object sender, UpdateEntity e)
    {
      try
      {
        if (e.EntityType == "Release")
        {
          var collection = PlayniteApi.Database.Games;
          var entity = collection.Get(e.EntityId);
          entity = entityUpdater.Update(entity, e.Entity);
          collection.Update(entity);
        }
        //else if (e.EntityType == "Platform")
        //{
        //  var collection = PlayniteApi.Database.Platforms;
        //  var entity = collection.Get(Guid.Parse(e.EntityId));
        //  entity = entityUpdater.Update(entity, e.Fields);
        //  collection.Update(entity);
        //}
        //else if (e.EntityType == "Genre")
        //{
        //  var collection = PlayniteApi.Database.Genres;
        //  var entity = collection.Get(Guid.Parse(e.EntityId));
        //  entity = entityUpdater.Update(entity, e.Fields);
        //  collection.Update(entity);
        //}
        //else if (e.EntityType == "Tag")
        //{
        //  var collection = PlayniteApi.Database.Tags;
        //  var entity = collection.Get(Guid.Parse(e.EntityId));
        //  entity = entityUpdater.Update(entity, e.Fields);
        //  collection.Update(entity);
        //}
        //else if (e.EntityType == "Feature")
        //{
        //  var collection = PlayniteApi.Database.Features;
        //  var entity = collection.Get(Guid.Parse(e.EntityId));
        //  entity = entityUpdater.Update(entity, e.Fields);
        //  collection.Update(entity);
        //}
        //else if (e.EntityType == "Series")
        //{
        //  var collection = PlayniteApi.Database.Series;
        //  var entity = collection.Get(Guid.Parse(e.EntityId));
        //  entity = entityUpdater.Update(entity, e.Fields);
        //  collection.Update(entity);
        //}
      }
      catch (Exception ex)
      {
        logger.Error(ex, $"Error occurred in Subscriber_OnUpdateEntity for Entity ID {e.EntityId}.");
      }

    }

    private void Subscriber_OnUninstallRelease(object sender, Release e)
    {
      try
      {
        if (!canRunPlaynite(e.Platform) || !e.IsInstalled)
        {
          logger.Debug($"Platform {e.Platform.Name} is not a PC platform or game is not installed.");
          return;
        }

        PlayniteApi.UninstallGame(e.Id);
      }
      catch (Exception ex)
      {
        logger.Error(ex, $"Error occurred in Subscriber_OnUninstallGameRequest for Game ID {e}.");

      }
    }


    private void Subscriber_OnInstallRelease(object sender, Release e)
    {
      try
      {
        if (!canRunPlaynite(e.Platform) || e.IsInstalled)
        {
          logger.Debug($"Platform {e.Platform.Name} is not a PC platform or game is already installed.");
          return;
        }

        //var gameStatePublisher = new PublishGameState(GameState.installing, (IMqttClient)mqtt, topicManager, serializer);
        //Task.WaitAll(gameStatePublisher.Publish(e).ToArray());
        PlayniteApi.InstallGame(e.Id);
      }
      catch (Exception ex)
      {
        logger.Error(ex, $"Error occurred in Subscriber_OnInstallGameRequest for Game ID {e}.");

      }
    }

    private void Subscriber_OnStartRelease(object sender, Release release)
    {
      if (!canRunPlaynite(release.Platform))
      {
        logger.Debug($"Platform {release.Platform.Name} is not a PC platform.");
        return;
      }

      if (release.RunState == RunState.Running)
      {
        logger.Debug($"Game {release.Name} is already running.");
        return;
      }

      if (!release.IsInstalled)
      {
        logger.Debug($"Game {release.Name} is not installed. Installing instead of starting.");
        //var gameStatePublisher = new PublishGameState(GameState.installing, (IMqttClient)mqtt, topicManager, serializer);
        //Task.WaitAll(gameStatePublisher.Publish(release).ToArray());
        PlayniteApi.InstallGame(release.Id);

        return;
      }

      PlayniteApi.StartGame(release.Id);
    }

    private bool canRunPlaynite(Platform platform)
    {
      return pcExpression.IsMatch(platform.Name);
    }

    private void Publisher_LibraryRefreshRequest(object sender, Task e)
    {
      logger.Info("Syncing library with Playnite Web.");
      Task.WhenAll(SyncLibrary().ToArray()).ContinueWith((t) => e.Start());
      logger.Info("Finished syncing library with Playnite Web.");

    }

    private void HandleVerifySettings(object sender, PlayniteWebSettings e)
    {
      StartConnection(e).Wait();
    }

    private async Task StartConnection(PlayniteWebSettings settings)
    {
      try
      {
        if (!string.IsNullOrEmpty(settings.ServerAddress) && !string.IsNullOrEmpty(settings.Username) && !settings.Password.Any())
        {
          logger.Error("Connection information is not properly configured. Please check your plugin settings.");
          return;
        }

        var password = Encoding.UTF8.GetString(ProtectedData.Unprotect(settings.Password, Id.ToByteArray(), DataProtectionScope.CurrentUser));


        gql = new GraphQLHttpClient($"{(settings.UseSecureConnection ? "https" : "http")}://{settings.ServerAddress}:{settings.Port}/api", new NewtonsoftJsonSerializer());
        gql.HttpClient.DefaultRequestHeaders.Add("User-Agent", $"PlayniteWeb/{_version} ({RuntimeInformation.OSDescription})");
        gql.HttpClient.DefaultRequestHeaders.Add("Playnite-DeviceId", settings.DeviceId.ToString());

        if (settings.Token == null || settings.Token.Length == 0)
        {
          var response = await gql.SendMutationAsync<dynamic>(new GraphQLRequest(query: @"
            mutation MyMutation($input: SignInInput) {
              signIn(input: $input) {
                credential
              }
            }
", variables: new { input = new { username = settings.Username, password = password } }), CancellationToken.None);

          if (response.Errors != null && response.Errors.Any())
          {
            logger.Error($"Error occurred while signing in: {string.Join(", ", response.Errors.Select(e => e.Message))}");
            return;
          }

          var protectedToken = ProtectedData.Protect(Encoding.UTF8.GetBytes(response.Data.signIn.credential.ToString()), Id.ToByteArray(), DataProtectionScope.CurrentUser);
          settings.Token = protectedToken;
        }

        var token = ProtectedData.Unprotect(settings.Token, Id.ToByteArray(), DataProtectionScope.CurrentUser);
        gql.HttpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {Encoding.UTF8.GetString(token)}");

        libraryPublisher = new PublishLibraryGraphQL(gql, PlayniteApi.Database, settings.DeviceId.ToString(), settings);
      } catch(Exception e)
      {
        logger.Error(e.Message);
      }
    }


    private void HandleGameUpdated(object sender, ItemUpdatedEventArgs<Playnite.SDK.Models.Game> e)
    {
      try
      {
        var games = PlayniteApi.Database.Games.ToList().GroupBy(game => game.Name)
            .Select(groupedByName => new Models.Game(groupedByName, pcPlatforms, emulatorSource))
            .Where(g => !g.Id.Equals(Guid.Empty));

        var updatedGamesData = e.UpdatedItems.Select(g => g.NewData);
        var updatedGames = updatedGamesData
            .Select(g => games.FirstOrDefault(game => game.Name == g.Name))
            .Where(g => g != null);

        if (!updatedGames.Any())
        {
          logger.Debug("No matching games found for update.");

        }

        //Task.WaitAll(updatedGames.SelectMany(item => gamePublisher.Publish(item)).ToArray());

        //var playlistPublications = PlayniteApi.Database.Tags
        //    .Where(tag => Regex.IsMatch(tag.Name, "^playlist-", RegexOptions.IgnoreCase))
        //    .Select(tag => new Playlist(tag.Name.Substring(9),
        //        games.Where(game => game.Releases.Any(release =>
        //            release.Tags?.Any(releaseTag => releaseTag.Id == tag.Id) ?? false))))
        //    .SelectMany(playlist => playlistPublisher.Publish(playlist));

        //Task.WaitAll(playlistPublications.ToArray());
      }
      catch (Exception ex)
      {
        logger.Error(ex, "Error occurred in HandleGameUpdated method.");

      }
    }
    private void HandlePlatformUpdated(object sender, ItemUpdatedEventArgs<Platform> e)
    {
      var updatedPlatforms = e.UpdatedItems.Select(g => g.NewData);
     // Task.WaitAll(updatedPlatforms.SelectMany(item => platformPublisher.Publish(item)).ToArray()
     //);
    }

    private void HandleOtherGameEntitiesUpdated(object sender, ItemUpdatedEventArgs<DatabaseObject> e)
    {
      var updates = e.UpdatedItems.Select(g => g.NewData);
     // Task.WaitAll(updates.SelectMany(item => gameEntityPublisher.Publish(item)).ToArray()
     //);
    }

    private void HandleCollectionUpdate(PlayniteWeb playniteWeb, ItemCollectionChangedEventArgs<DatabaseObject> e)
    {
      //var games = PlayniteApi.Database.Games.ToList().GroupBy(game => game.Name)
      //      .Select(groupedByName => new Models.Game(groupedByName, pcPlatforms, emulatorSource))
      //      .Where(g => g != null)
      //      .Where(g => !g.Id.Equals(Guid.Empty))
      //      .ToList();

      //Task.WaitAll(e.AddedItems.SelectMany(item =>
      //{
      //  if (item.GetType() == typeof(Playnite.SDK.Models.Game))
      //  {
      //    var updatedGame = games.FirstOrDefault(game => game.Name == ((Playnite.SDK.Models.Game)item).Name);
      //    return gamePublisher.Publish(updatedGame);
      //  }
      //  if (item.GetType() == typeof(Platform))
      //  {
      //    return platformPublisher.Publish(item);
      //  }

      //  return gameEntityPublisher.Publish(item);
      //}).ToArray());

      //Task.WaitAll(e.RemovedItems.SelectMany(item => gameEntityRemovalPublisher.Publish(item)).ToArray());
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
