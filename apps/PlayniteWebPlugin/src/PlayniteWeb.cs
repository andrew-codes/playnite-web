using GraphQL;
using GraphQL.Client.Http;
using Playnite.SDK;
using Playnite.SDK.Data;
using Playnite.SDK.Events;
using Playnite.SDK.Models;
using Playnite.SDK.Plugins;
using PlayniteWeb.Models;
using PlayniteWeb.Services;
using PlayniteWeb.Services.Publishers;
using PlayniteWeb.Services.Publishers.GraphQL;
using PlayniteWeb.Services.Publishers.WebSocket;
using PlayniteWeb.UI;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Reactive;
using System.Reactive.Concurrency;
using System.Reactive.Linq;
using System.Reactive.Subjects;
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
    private readonly ISerializeObjects serializer;
    private readonly Subject<ItemUpdatedEventArgs<DatabaseObject>> gameUpdates;
    private readonly Subject<ItemUpdatedEventArgs<DatabaseObject>> platformUpdates;
    private readonly Subject<ItemUpdatedEventArgs<DatabaseObject>> sourceUpdates;
    private readonly Subject<ItemUpdatedEventArgs<DatabaseObject>> tagUpdates;
    private readonly Subject<ItemUpdatedEventArgs<DatabaseObject>> completionStateUpdates;
    private readonly Subject<ItemUpdatedEventArgs<DatabaseObject>> featureUpdates;
    private readonly IObservable<EventPattern<ItemUpdatedEventArgs<DatabaseObject>>> entityUpdated;

    private readonly Subject<ItemCollectionChangedEventArgs<DatabaseObject>> gameCollectionUpdates;
    private readonly Subject<ItemCollectionChangedEventArgs<DatabaseObject>> platformCollectionUpdates;
    private readonly Subject<ItemCollectionChangedEventArgs<DatabaseObject>> sourceCollectionUpdates;
    private readonly Subject<ItemCollectionChangedEventArgs<DatabaseObject>> tagCollectionUpdates;
    private readonly Subject<ItemCollectionChangedEventArgs<DatabaseObject>> completionStateCollectionUpdates;
    private readonly Subject<ItemCollectionChangedEventArgs<DatabaseObject>> featureCollectionUpdates;
    private readonly IObservable<EventPattern<ItemCollectionChangedEventArgs<DatabaseObject>>> collectionUpdated;
    private readonly ConcurrentDictionary<Guid, PendingUpdate> pendingUpdates = new ConcurrentDictionary<Guid, PendingUpdate>();
    private readonly IEnumerable<MainMenuItem> mainMenuItems;
    private PlayniteWebSettingsViewModel settings { get; set; }
    private readonly ILogger logger = LogManager.GetLogger();
    private readonly Regex pcExpression = new Regex("Windows.*");
    private readonly string _version;
    private readonly GameSource emulatorSource = new GameSource("Emulator");
    private PublishLibraryGraphQL libraryPublisher;
    private IPublishToPlayniteWeb<IIdentifiable> releasePublisher;
    private IPublishToPlayniteWeb<IIdentifiable> platformPublisher;
    private IPublishToPlayniteWeb<IIdentifiable> sourcePublisher;
    private IPublishToPlayniteWeb<IIdentifiable> tagPublisher;
    private IPublishToPlayniteWeb<IIdentifiable> completionStatusPublisher;
    private IPublishToPlayniteWeb<IIdentifiable> featurePublisher;
    private PublishReleaseRunState releaseRunStatePublisher;

    private OnlyPublishCollectionAfterSync releaseCollectionPublisher;
    private OnlyPublishCollectionAfterSync platformCollectionPublisher;
    private OnlyPublishCollectionAfterSync sourceCollectionPublisher;
    private OnlyPublishCollectionAfterSync tagCollectionPublisher;
    private IObservable<GraphQLResponse<dynamic>> entityUpdates;
    private GraphQLHttpClient gql;
    private OnlyPublishCollectionAfterSync completionStatusCollectionPublisher;
    private OnlyPublishCollectionAfterSync featureStatusCollectionPublisher;


#if DEBUG
    private readonly int publishingThrottle = 1;
#else
    private readonly int publishingThrottle = 10;
#endif

    public override Guid Id { get; } = Guid.Parse("ec3439e3-51ee-43cb-9a8a-5d82cf45edac");

    public PlayniteWeb(IPlayniteAPI api) : base(api)
    {
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

      settings = new PlayniteWebSettingsViewModel(this, api.Database);
      serializer = new ObjectSerializer();

      var deserializer = new ObjectDeserializer();
      Properties = new GenericPluginProperties
      {
        HasSettings = true
      };

      gameUpdates = new Subject<ItemUpdatedEventArgs<DatabaseObject>>();
      gameUpdates.Throttle(TimeSpan.FromSeconds(publishingThrottle));
      platformUpdates = new Subject<ItemUpdatedEventArgs<DatabaseObject>>();
      platformUpdates.Throttle(TimeSpan.FromSeconds(publishingThrottle));
      sourceUpdates = new Subject<ItemUpdatedEventArgs<DatabaseObject>>();
      sourceUpdates.Throttle(TimeSpan.FromSeconds(publishingThrottle));
      tagUpdates = new Subject<ItemUpdatedEventArgs<DatabaseObject>>();
      tagUpdates.Throttle(TimeSpan.FromSeconds(publishingThrottle));
      completionStateUpdates = new Subject<ItemUpdatedEventArgs<DatabaseObject>>();
      completionStateUpdates.Throttle(TimeSpan.FromSeconds(publishingThrottle));
      featureUpdates = new Subject<ItemUpdatedEventArgs<DatabaseObject>>();
      featureUpdates.Throttle(TimeSpan.FromSeconds(publishingThrottle));

      var handlers = new EventHandlers();

      entityUpdated = Observable.FromEventPattern<ItemUpdatedEventArgs<DatabaseObject>>(h =>
      {
        PlayniteApi.Database.Games.ItemUpdated += handlers.RegisterItemUpdateHandler<Game>(h);
        PlayniteApi.Database.Platforms.ItemUpdated+=  handlers.RegisterItemUpdateHandler<Platform>(h);
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
        PlayniteApi.Database.Games.ItemUpdated -= handlers.GetItemUpdateHandler<Game>();
        PlayniteApi.Database.Platforms.ItemUpdated -= handlers.GetItemUpdateHandler<Platform>();
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
      entityUpdated.Subscribe(e =>{
        var type = e.EventArgs.UpdatedItems.First().NewData;
        if (type is Game) {
          gameUpdates.OnNext(e.EventArgs);

        }
        else if (type is Platform)
        {
          platformUpdates.OnNext(e.EventArgs);
        }
        else if (type is GameSource)
        {
          sourceUpdates.OnNext(e.EventArgs);
        }
        else if (type is Tag)
        {
          tagUpdates.OnNext(e.EventArgs);
        }
        else if (type is CompletionStatus)
        {
          completionStateUpdates.OnNext(e.EventArgs);
        }
        else if (type is GameFeature)
        {
          featureUpdates.OnNext(e.EventArgs);
        }
      });

      gameCollectionUpdates = new Subject<ItemCollectionChangedEventArgs<DatabaseObject>>();
      gameCollectionUpdates.Throttle(TimeSpan.FromSeconds(publishingThrottle));
      platformCollectionUpdates = new Subject<ItemCollectionChangedEventArgs<DatabaseObject>>();
      platformCollectionUpdates.Throttle(TimeSpan.FromSeconds(publishingThrottle));
      sourceCollectionUpdates = new Subject<ItemCollectionChangedEventArgs<DatabaseObject>>();
      sourceCollectionUpdates.Throttle(TimeSpan.FromSeconds(publishingThrottle));
      tagCollectionUpdates = new Subject<ItemCollectionChangedEventArgs<DatabaseObject>>();
      tagCollectionUpdates.Throttle(TimeSpan.FromSeconds(publishingThrottle));
      completionStateCollectionUpdates = new Subject<ItemCollectionChangedEventArgs<DatabaseObject>>();
      completionStateCollectionUpdates.Throttle(TimeSpan.FromSeconds(publishingThrottle));
      featureCollectionUpdates = new Subject<ItemCollectionChangedEventArgs<DatabaseObject>>();
      featureCollectionUpdates.Throttle(TimeSpan.FromSeconds(publishingThrottle));
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
        PlayniteApi.Database.Sources.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<GameSource>();
        PlayniteApi.Database.Tags.ItemCollectionChanged -= handlers.GetCollectionUpdateHandler<Tag>();
      }
        );
      collectionUpdated.Subscribe(e => {
        DatabaseObject entity = null;
        if (e.EventArgs.AddedItems.Any())
        {
          entity = e.EventArgs.AddedItems.FirstOrDefault();
        } else if (e.EventArgs.RemovedItems.Any())
        {
          entity = e.EventArgs.RemovedItems.FirstOrDefault();
        }
        if (entity == null)
        {
          logger.Error("No entity found in collection update event.");
          return;
        }

        if (entity is Game)
        {
          gameCollectionUpdates.OnNext(e.EventArgs);
        }
        else if (entity is Platform)
        {
          platformCollectionUpdates.OnNext(e.EventArgs);
        }
        else if (entity is GameSource)
        {
          sourceCollectionUpdates.OnNext(e.EventArgs);
        }
        else if (entity is Tag)
        {
          tagCollectionUpdates.OnNext(e.EventArgs);
        }
        else if (entity is CompletionStatus)
        {
          completionStateCollectionUpdates.OnNext(e.EventArgs);
        }
        else if (entity is GameFeature)
        {
          featureCollectionUpdates.OnNext(e.EventArgs);
        }
      });

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
        if (libraryPublisher == null)
        {
            logger.Error("GraphQL client is not initialized. Cannot sync library.");

            yield return Task.CompletedTask;
            yield break;
        }

      yield return libraryPublisher.Publish();
    }

    //private Release ReleaseFromPlayniteGame(Game game)
    //{
    //  var g = GameFromRelease(game);
    //  var release = g.Releases.FirstOrDefault(r => r.Id == game.Id);
    //  if (release == null)
    //  {
    //    logger.Debug($"Release not found for Game {game.Name} with ID {game.Id}.");
    //  }

    //  return release;
    //}

    //private Models.Game GameFromRelease(Game game)
    //{
    //  var games = PlayniteApi.Database.Games.Where(g => g.Name == game.Name).ToList();
    //  return new Models.Game(games, pcPlatforms, emulatorSource);
    //}

    //public override void OnLibraryUpdated(OnLibraryUpdatedEventArgs args)
    //{
    //}

    //public override void OnGameInstalled(OnGameInstalledEventArgs args)
    //{
    //  var release = ReleaseFromPlayniteGame(args.Game);
    //  //var gameStatePublisher = new PublishGameState(GameState.installed, (IMqttClient)mqtt, topicManager, serializer);
    //  //Task.WaitAll(gameStatePublisher.Publish(release).ToArray());
    //}

    public override void OnGameStarted(OnGameStartedEventArgs args)
    {
      if (releaseRunStatePublisher == null)
      {
        logger.Error("GraphQL client is not initialized. Cannot handle game updates.");
        return;
      }

      try
      {
        releaseRunStatePublisher.Publish(args.Game).Wait();
      }
      catch (Exception ex)
      {
        logger.Error(ex, "Error occurred while publishing game started event.");
      }
      
    }

    //public override void OnGameStarting(OnGameStartingEventArgs args)
    //{
    //  //var release = ReleaseFromPlayniteGame(args.Game);
    //  //var gameStatePublisher = new PublishGameState(GameState.launching, (IMqttClient)mqtt, topicManager, serializer);
    //  //Task.WaitAll(gameStatePublisher.Publish(release).ToArray());
    //}

    public override void OnGameStopped(OnGameStoppedEventArgs args)
    {
      if (releaseRunStatePublisher == null)
      {
        logger.Error("GraphQL client is not initialized. Cannot handle game updates.");
        return;
      }

      try
      {
        releaseRunStatePublisher.Publish(args.Game).Wait();
      }
      catch (Exception ex)
      {
        logger.Error(ex, "Error occurred while publishing game started event.");
      }
    }

    //public override void OnGameUninstalled(OnGameUninstalledEventArgs args)
    //{
    //  var release = ReleaseFromPlayniteGame(args.Game);
    //  //var gameStatePublisher = new PublishGameState(GameState.uninstalled, (IMqttClient)mqtt, topicManager, serializer);
    //  //Task.WaitAll(gameStatePublisher.Publish(release).ToArray());
    //}

    //private void Subscriber_OnRestartRelease(object sender, Release e)
    //{
    //  this.Subscriber_OnStopRelease(sender, e);
    //  Task.Delay(3000).ContinueWith(t => this.Subscriber_OnStartRelease(sender, e));
    //}

    //private void Subscriber_OnStopRelease(object sender, Release e)
    //{
    //  if (!canRunPlaynite(e.Platform))
    //  {
    //    logger.Debug($"Platform {e.Platform.Name} is not a PC platform.");
    //    return;
    //  }

    //  if (e.RunState != RunState.Running)
    //  {
    //    logger.Debug($"Game {e.Name} is not running.");
    //    return;
    //  }

    //  try
    //  {
    //    var gameProcess = Process.GetProcessById(e.ProcessId.Value);
    //    gameProcess.Kill();
    //  }
    //  catch (Exception ex)
    //  {
    //    logger.Error(ex, $"Error occurred in Subscriber_OnStopRelease for Game ID {e.Id}.");
    //    var process = Process.GetProcessesByName(e.Name).FirstOrDefault();
    //    if (process == null)
    //    {
    //      process = Process.GetProcesses().Where(p => p.MainWindowTitle.Contains(e.Name)).FirstOrDefault();

    //      if (process == null) { return; }
    //    }

    //    process.Kill();
    //  }
    //}

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

    public override void OnApplicationStarted(OnApplicationStartedEventArgs args)
    {
      settings.OnVerifySettings += HandleVerifySettings;
      StartConnection(settings.Settings);

      gameUpdates.Subscribe(e => HandleGameUpdated(this, e));
      platformUpdates.Subscribe(e => HandlePlatformUpdated(this, e));
      sourceUpdates.Subscribe(e => HandleSourceUpdated(this, e));
      tagUpdates.Subscribe(e => HandleTagUpdated(this, e));
      completionStateUpdates.Subscribe(e => HandleCompletionStatusUpdated(this, e));
      featureUpdates.Subscribe(e => HandleFeatureUpdated(this, e));


      gameCollectionUpdates.Subscribe(e => HandleGameCollectionUpdate(this, e));
      platformCollectionUpdates.Subscribe(e => HandlePlatformCollectionUpdate(this, e));
      sourceCollectionUpdates.Subscribe(e => HandleSourceCollectionUpdate(this, e));
      tagCollectionUpdates.Subscribe(e => HandleTagCollectionUpdate(this, e));
      completionStateCollectionUpdates.Subscribe(e => HandleCompletionStateCollectionUpdate(this, e));
      featureCollectionUpdates.Subscribe(e => HandleFeatureCollectionUpdate(this, e));
    }

    public override void OnApplicationStopped(OnApplicationStoppedEventArgs args)
    {
      settings.OnVerifySettings -= HandleVerifySettings;

      gameUpdates.Dispose();
      platformUpdates.Dispose();
      sourceUpdates.Dispose();
      tagUpdates.Dispose();
      completionStateUpdates.Dispose();
      featureUpdates.Dispose();

      gameCollectionUpdates.Dispose();
      platformCollectionUpdates.Dispose();
      sourceCollectionUpdates.Dispose();
      tagCollectionUpdates.Dispose();
      completionStateCollectionUpdates.Dispose();
      featureCollectionUpdates.Dispose();
    }

    private void HandleVerifySettings(object sender, PlayniteWebSettings e)
    {
      StartConnection(e);
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


        gql = new GraphQLHttpClient($"{(settings.UseSecureConnection ? "https" : "http")}://{settings.ServerAddress}:{settings.Port}/api", new GraphSerializer());
        gql.HttpClient.DefaultRequestHeaders.Add("User-Agent", $"PlayniteWeb/{_version} ({RuntimeInformation.OSDescription})");
        gql.HttpClient.DefaultRequestHeaders.Add("Playnite-DeviceId", settings.DeviceId.ToString());

        if (settings.Token == null || settings.Token.Length == 0)
        {
          logger.Debug("No existing auth token found. Signing in to obtain new token.");
          var response = await gql.SendMutationAsync<SignInMutation>(new GraphQLRequest(query: @"
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

          var protectedToken = ProtectedData.Protect(Encoding.UTF8.GetBytes(response.Data.SignIn.Credential.ToString()), Id.ToByteArray(), DataProtectionScope.CurrentUser);
          settings.Token = protectedToken;
        }

        var token = ProtectedData.Unprotect(settings.Token, Id.ToByteArray(), DataProtectionScope.CurrentUser);
        gql.HttpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {Encoding.UTF8.GetString(token)}");

        libraryPublisher = new PublishLibraryGraphQL(gql, PlayniteApi.Database, settings.DeviceId.ToString(), settings, this);
        releasePublisher = new OnlyPublishAfterSync(settings, new PublishReleaseGraphQL(gql, settings.DeviceId.ToString(), settings));
        platformPublisher = new OnlyPublishAfterSync(settings, new PublishEntityGraphQL(gql, settings.DeviceId.ToString(), settings, EntityType.platforms));
        sourcePublisher =  new OnlyPublishAfterSync(settings, new PublishEntityGraphQL(gql, settings.DeviceId.ToString(), settings, EntityType.sources));
        tagPublisher =  new OnlyPublishAfterSync(settings, new PublishEntityGraphQL(gql, settings.DeviceId.ToString(), settings, EntityType.tags));
        completionStatusPublisher =  new OnlyPublishAfterSync(settings, new PublishEntityGraphQL(gql, settings.DeviceId.ToString(), settings, EntityType.completionStates));
        featurePublisher =  new OnlyPublishAfterSync(settings, new PublishEntityGraphQL(gql, settings.DeviceId.ToString(), settings, EntityType.features));

        releaseRunStatePublisher = new PublishReleaseRunState(gql, settings.DeviceId.ToString(), settings);

        releaseCollectionPublisher = new OnlyPublishCollectionAfterSync(settings, new PublishReleaseCollectionGraphQL(gql, settings.DeviceId.ToString(), settings));
        platformCollectionPublisher = new OnlyPublishCollectionAfterSync(settings, new PublishEntiyCollectionGraphQL(gql, settings.DeviceId.ToString(), settings, EntityType.platforms));
        sourceCollectionPublisher = new OnlyPublishCollectionAfterSync(settings, new PublishEntiyCollectionGraphQL(gql, settings.DeviceId.ToString(), settings, EntityType.sources));
        tagCollectionPublisher = new OnlyPublishCollectionAfterSync(settings, new PublishEntiyCollectionGraphQL(gql, settings.DeviceId.ToString(), settings, EntityType.tags));
        completionStatusCollectionPublisher = new OnlyPublishCollectionAfterSync(settings, new PublishEntiyCollectionGraphQL(gql, settings.DeviceId.ToString(), settings, EntityType.completionStates));
        featureStatusCollectionPublisher = new OnlyPublishCollectionAfterSync(settings, new PublishEntiyCollectionGraphQL(gql, settings.DeviceId.ToString(), settings, EntityType.features));

      entityUpdates = gql.CreateSubscriptionStream<dynamic>(new GraphQLHttpRequest
        {
          Query = @"subscription {
              entityUpdated {
                id
                type
                playniteId
                fields {
                  key
                  value
                  playniteId
                  playniteIds
                }
                source
              }
            }"
        });
        entityUpdates.SubscribeOn(Scheduler.Default)
          .Subscribe(HandleEntityUpdates);
      }
      catch (Exception e)
      {
        logger.Error(e.Message);
      }
    }

    private void HandleEntityUpdates(GraphQLResponse<dynamic> response)
    {
      try
      {
        if (response?.Data?.entityUpdated == null)
        {
          logger.Error("Received null entity update from GraphQL subscription.");
          return;
        }

       
          var allowedUpdaters = new Dictionary<string, Type>();
          allowedUpdaters.Add("Release", typeof(ReleaseFieldUpdate));

          foreach (var updateRequest in response.Data.entityUpdated)
          {
            if (Guid.TryParse(updateRequest.source.ToString(), out Guid sourceId) && sourceId.Equals(settings.Settings.DeviceId)) {
              logger.Debug($"Source was myself. Skipping update.");
              continue;
            }
          var update = new EntityUpdate(updateRequest, allowedUpdaters);


            pendingUpdates.AddOrUpdate(update.Id.Value, key =>
            {
              var fieldValues = new ConcurrentDictionary<string, FieldUpdateValues>(update.Fields.ToDictionary(field => field.Key).AsEnumerable());
              return new PendingUpdate(updateRequest.source.ToString(), update.Id.Value, fieldValues);
            },
              (_, v) =>
              {
                foreach (var field in update.Fields)
                {
                  v.Fields.AddOrUpdate(field.Key, key => field, (key, fieldValue) =>
                  {
                    if (field.PlayniteId != null)
                    {
                      fieldValue.PlayniteId = field.PlayniteId;
                    }
                    fieldValue.PlayniteIds.AddRange(field.PlayniteIds);
                    return fieldValue;
                  });
                }
                return v;
              });

            switch (updateRequest.type.ToString())
            {
              case "Release":
                var game = PlayniteApi.Database.Games.Get(update.Id.Value);
                if (game == null)
                {
                  logger.Debug($"No game found with ID: {update.Id.Value}");
                  return;
                }
                game = update.Update(game) as Game;
                PlayniteApi.Database.Games.Update(game);
                break;
              default:
                logger.Warn($"Unknown entity type received: {updateRequest.type.ToString()}");
                break;
            }
          }
      }
      catch (Exception ex)
      {
        logger.Error(ex, "Error processing entity update from GraphQL subscription.");
      }
     
    }

    private void HandleGameUpdated(object sender, ItemUpdatedEventArgs<DatabaseObject> e)
    {
        if (releasePublisher == null)
        {
          logger.Error("GraphQL client is not initialized. Cannot handle game updates.");
          return;
        }

      logger.Debug($"Handling game update for {e.UpdatedItems.Count()} games.");
      var games = e.UpdatedItems
        .Select(g => g.NewData as IIdentifiable)
        .Where(g => g != null && !g.Id.Equals(Guid.Empty));

      var itemsToPublish = games
          .Where(g => !pendingUpdates.ContainsKey(g.Id))
          .ToList();


      foreach(var game in games.Where(g => pendingUpdates.ContainsKey(g.Id)))
      {
        pendingUpdates.TryRemove(game.Id, out PendingUpdate pendingUpdate);
      }

      logger.Debug($"Found {itemsToPublish.Count} games to publish updates for.");


      Task.WhenAll(releasePublisher.Publish(itemsToPublish))
      .ContinueWith(t =>
      {
        if (t.IsFaulted)
        {
          logger.Error(t.Exception, "Error occurred while publishing game updates.");
        }
        else
        {
          logger.Debug($"Published {e.UpdatedItems.Count()} game updates successfully.");
        }
      });
    }

    private void HandlePlatformUpdated(object sender, ItemUpdatedEventArgs<DatabaseObject> e)
    {
      if (platformPublisher == null) {
        logger.Error("GraphQL client is not initialized. Cannot handle platform updates.");
        return;
      }
      logger.Debug($"Handling platform update for {e.UpdatedItems.Count()} platforms.");
      Task.WhenAll(platformPublisher.Publish(e.UpdatedItems.Select(g => g.NewData)))
        .ContinueWith(t =>
        {
          if (t.IsFaulted)
          {
            logger.Error(t.Exception, "Error occurred while publishing platform updates.");
          }
          else
          {
            logger.Debug($"Published {e.UpdatedItems.Count()} platform updates successfully.");
          }
        })
        .Wait();
    }

    private void HandleCompletionStatusUpdated(PlayniteWeb playniteWeb, ItemUpdatedEventArgs<DatabaseObject> e)
    {
      if (completionStatusPublisher == null)
      {
        logger.Error("GraphQL client is not initialized. Cannot handle platform updates.");
        return;
      }
      logger.Debug($"Handling platform update for {e.UpdatedItems.Count()} platforms.");
      Task.WhenAll(completionStatusPublisher.Publish(e.UpdatedItems.Select(g => g.NewData)))
        .ContinueWith(t =>
        {
          if (t.IsFaulted)
          {
            logger.Error(t.Exception, "Error occurred while publishing platform updates.");
          }
          else
          {
            logger.Debug($"Published {e.UpdatedItems.Count()} platform updates successfully.");
          }
        })
        .Wait();
    }

    private void HandleFeatureUpdated(PlayniteWeb playniteWeb, ItemUpdatedEventArgs<DatabaseObject> e)
    {
      if (featurePublisher == null)
      {
        logger.Error("GraphQL client is not initialized. Cannot handle platform updates.");
        return;
      }
      logger.Debug($"Handling platform update for {e.UpdatedItems.Count()} platforms.");
      Task.WhenAll(featurePublisher.Publish(e.UpdatedItems.Select(g => g.NewData)))
        .ContinueWith(t =>
        {
          if (t.IsFaulted)
          {
            logger.Error(t.Exception, "Error occurred while publishing platform updates.");
          }
          else
          {
            logger.Debug($"Published {e.UpdatedItems.Count()} platform updates successfully.");
          }
        })
        .Wait();
    }

    private void HandleTagUpdated(PlayniteWeb playniteWeb, ItemUpdatedEventArgs<DatabaseObject> e)
    {
      if (tagPublisher == null)
      {
        logger.Error("GraphQL client is not initialized. Cannot handle platform updates.");
        return;
      }
      logger.Debug($"Handling platform update for {e.UpdatedItems.Count()} platforms.");
      Task.WhenAll(tagPublisher.Publish(e.UpdatedItems.Select(g => g.NewData)))
        .ContinueWith(t =>
        {
          if (t.IsFaulted)
          {
            logger.Error(t.Exception, "Error occurred while publishing platform updates.");
          }
          else
          {
            logger.Debug($"Published {e.UpdatedItems.Count()} platform updates successfully.");
          }
        })
        .Wait();
    }

    private void HandleSourceUpdated(PlayniteWeb playniteWeb, ItemUpdatedEventArgs<DatabaseObject> e)
    {
      if (sourcePublisher == null)
      {
        logger.Error("GraphQL client is not initialized. Cannot handle platform updates.");
        return;
      }
      logger.Debug($"Handling platform update for {e.UpdatedItems.Count()} platforms.");
      Task.WhenAll(sourcePublisher.Publish(e.UpdatedItems.Select(g => g.NewData)))
        .ContinueWith(t =>
        {
          if (t.IsFaulted)
          {
            logger.Error(t.Exception, "Error occurred while publishing platform updates.");
          }
          else
          {
            logger.Debug($"Published {e.UpdatedItems.Count()} platform updates successfully.");
          }
        })
        .Wait();
    }


    private void HandleGameCollectionUpdate(PlayniteWeb playniteWeb, ItemCollectionChangedEventArgs<DatabaseObject> e)
    {
      if (releaseCollectionPublisher == null)
      {
        logger.Warn("GraphQL client is not initialized. Cannot handle game collection updates.");
        return;
      }

      Task.WhenAll(releaseCollectionPublisher.Publish(e.AddedItems, e.RemovedItems))
        .ContinueWith(t =>
        {
          if (t.IsFaulted)
          {
            logger.Error(t.Exception, "Error occurred while publishing game collection updates.");
          }
          else
          {
            logger.Debug($"Published {e.AddedItems.Count()} game collection updates successfully.");
          }
        });
    }


    private void HandlePlatformCollectionUpdate(PlayniteWeb playniteWeb, ItemCollectionChangedEventArgs<DatabaseObject> e)
    {
      if (platformCollectionPublisher == null) {
        logger.Warn("GraphQL client is not initialized. Cannot handle platform collection updates.");
        return;
      }


        Task.WhenAll(platformCollectionPublisher.Publish(e.AddedItems, e.RemovedItems))
         .ContinueWith(t =>
         {
           if (t.IsFaulted)
           {
             logger.Error(t.Exception, "Error occurred while publishing platform collection updates.");
           }
           else
           {
             logger.Debug($"Published {e.AddedItems.Count()} platform collection updates successfully.");
           }
         });

    }

    private void HandleSourceCollectionUpdate (PlayniteWeb playniteWeb, ItemCollectionChangedEventArgs<DatabaseObject> e)
    {
      if (sourceCollectionPublisher == null) {
        logger.Warn("GraphQL client is not initialized. Cannot handle source collection updates.");
        return;
        }

       Task.WhenAll(sourceCollectionPublisher.Publish(e.AddedItems, e.RemovedItems))
        .ContinueWith(t =>
        {
          if (t.IsFaulted)
          {
            logger.Error(t.Exception, "Error occurred while publishing source collection updates.");
          }
          else
          {
            logger.Debug($"Published {e.AddedItems.Count()} source collection updates successfully.");
          }
        });
    }

    private void HandleTagCollectionUpdate(PlayniteWeb playniteWeb, ItemCollectionChangedEventArgs<DatabaseObject> e)
    {
      if (tagCollectionPublisher == null) {
        logger.Warn("GraphQL client is not initialized. Cannot handle tag collection updates.");
        return;
        }

       Task.WhenAll(tagCollectionPublisher.Publish(e.AddedItems, e.RemovedItems))
        .ContinueWith(t =>
        {
          if (t.IsFaulted)
          {
            logger.Error(t.Exception, "Error occurred while publishing tag collection updates.");
          }
          else
          {
            logger.Debug($"Published {e.AddedItems.Count()} tag collection updates successfully.");
          }
        });
    }

    private void HandleCompletionStateCollectionUpdate(PlayniteWeb playniteWeb, ItemCollectionChangedEventArgs<DatabaseObject> e)
    {
      if (completionStatusCollectionPublisher == null) {
        logger.Warn("GraphQL client is not initialized. Cannot handle source collection updates.");
        return;
        }

       Task.WhenAll(completionStatusCollectionPublisher.Publish(e.AddedItems, e.RemovedItems))
        .ContinueWith(t =>
        {
          if (t.IsFaulted)
          {
            logger.Error(t.Exception, "Error occurred while publishing source collection updates.");
          }
          else
          {
            logger.Debug($"Published {e.AddedItems.Count()} source collection updates successfully.");
          }
        });
    }

    private void HandleFeatureCollectionUpdate(PlayniteWeb playniteWeb, ItemCollectionChangedEventArgs<DatabaseObject> e)
    {
      if (featureStatusCollectionPublisher == null) {
        logger.Warn("GraphQL client is not initialized. Cannot handle feature collection updates.");
        return;
        }

       Task.WhenAll(featureStatusCollectionPublisher.Publish(e.AddedItems, e.RemovedItems))
        .ContinueWith(t =>
        {
          if (t.IsFaulted)
          {
            logger.Error(t.Exception, "Error occurred while publishing feature collection updates.");
          }
          else
          {
            logger.Debug($"Published {e.AddedItems.Count()} feature collection updates successfully.");
          }
        });
    }
  }
}
