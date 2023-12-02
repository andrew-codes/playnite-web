using MQTTnet.Client;
using MQTTnet.Protocol;
using Playnite.SDK;
using Playnite.SDK.Models;
using PlayniteWeb.Services;
using PlayniteWeb.Services.Mqtt;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace PlayniteWeb
{
  internal class MqttGamePublisher : IPublishGamesToPlayniteWeb<IMqttClient>
  {
    private readonly IManageTopics topicBuilder;
    private readonly ISerializeObjects serializer;
    private readonly IGameDatabaseAPI gameDatabase;
    private IMqttClient client;

    public MqttGamePublisher(IMqttClient client, IManageTopics topicBuilder, IGameDatabaseAPI gameDatabase)
    {
      this.client = client;
      client.ApplicationMessageReceivedAsync += MesssageReceived;

      this.topicBuilder = topicBuilder;
      this.gameDatabase = gameDatabase;
      this.serializer = new ObjectSerializer();
    }

    public event EventHandler<Task> LibraryRefreshRequest;

    private string toAssetId(string assetFilePath)
    {
      return assetFilePath.Split('\\').Last();
    }

    private Task publishFile(string topic, string filePath)
    {
      if (!client.IsConnected)
      {
        return Task.CompletedTask;
      }

      if (string.IsNullOrEmpty(topic) || string.IsNullOrEmpty(filePath))
      {
        return Task.CompletedTask;
      }

      var fullPath = gameDatabase.GetFullFilePath(filePath);
      if (!File.Exists(fullPath))
      {
        return Task.CompletedTask;
      }

      using (var fileStream = File.OpenRead(fullPath))
      {
        var result = new byte[fileStream.Length];
        fileStream.Read(result, 0, result.Length);

        return client.PublishBinaryAsync(
            topic,
            result,
            retain: false,
            qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce,
            cancellationToken: default);
      }
    }

    public void StartConnection(IApplyPublisherOptions<IMqttClient> options)
    {
      client = options.ApplyOptions(client);
      if (!client.IsConnected)
      {
        return;
      }

      client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.Connection()), "online", MqttQualityOfServiceLevel.AtLeastOnce, retain: false, cancellationToken: default).Wait(cancellationToken: default);
    }

    private Task MesssageReceived(MqttApplicationMessageReceivedEventArgs args)
    {
      var task = Task.CompletedTask;
      if (args.ApplicationMessage.Topic == topicBuilder.GetSubscribeTopic(SubscribeTopics.RequestLibraryPublish))
      {
        LibraryRefreshRequest.Invoke(this, task);
      }

      task.Wait(cancellationToken: default);

      return task;
    }

    public Task StartDisconnect()
    {
      if (!client.IsConnected)
      {
        return Task.CompletedTask;
      }

      return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.Connection()), "offline", retain: false, cancellationToken: default)
        .ContinueWith(async r => await client.DisconnectAsync());
    }

    public IEnumerable<Task> PublishLibrary()
    {
      if (!client.IsConnected)
      {
        yield return Task.CompletedTask;
        yield break;
      }

      yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.LibraryRequesteCompleted()), "start");

      IEnumerable<string> ignored = new List<string> {
        "Games", "Platforms", "ImportExclusions", "FilterPresets", "IsOpen"
      };
      var gameEntityProperties = typeof(IGameDatabase)
        .GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.GetProperty)
        .Where(propertyInfo => !ignored.Any(ignore => ignore == propertyInfo.Name));
      var gameEntities = gameEntityProperties
        .SelectMany(propertyInfo => (IEnumerable<DatabaseObject>)propertyInfo.GetValue(gameDatabase));

      var gamePublications = PublishGames(gameDatabase.Games);
      var platformPublications = gameDatabase.Platforms.SelectMany(PublishPlatform);
      var otherGameEntityPublications = gameEntities.Select(PublishGameEntity);


      var tasksToYield = gamePublications.Concat(platformPublications.Concat(otherGameEntityPublications));

      foreach (var task in tasksToYield)
      {
        yield return task;
      }

      yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.LibraryRequesteCompleted()), "end");
    }

    private Task PublishGameEntity(IIdentifiable gameEntity)
    {
      return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.GameEntity(gameEntity.GetType().Name, gameEntity.Id)), serializer.Serialize(gameEntity), retain: false, qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce);
    }

    public IEnumerable<Task> PublishGames(IEnumerable<Game> games)
    {
      if (!client.IsConnected)
      {
        return Enumerable.Empty<Task>();
      }

      return games.SelectMany(PublishGame);
    }

    private IEnumerable<Task> PublishGame(Game game)
    {
      yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.Game(game.Id)), serializer.Serialize(game), MqttQualityOfServiceLevel.AtLeastOnce, retain: false, cancellationToken: default);

      if (!string.IsNullOrEmpty(game.CoverImage))
      {
        yield return publishFile(PublishTopics.GameFile(game.Id, toAssetId(game.CoverImage)), game.CoverImage);
      }

      if (!string.IsNullOrEmpty(game.BackgroundImage))
      {
        yield return publishFile(PublishTopics.GameFile(game.Id, toAssetId(game.BackgroundImage)), game.CoverImage);
      }
    }


    private IEnumerable<Task> PublishPlatform(Platform platform)
    {
      yield return client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.Platform(platform.Id)), serializer.Serialize(platform), retain: false, qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce);

      if (!string.IsNullOrEmpty(platform.Cover))
      {
        yield return publishFile(topicBuilder.GetPublishTopic(PublishTopics.PlatformFile(platform.Id, toAssetId(platform.Cover))), platform.Cover);
      }
      if (!string.IsNullOrEmpty(platform.Background))
      {
        yield return publishFile(topicBuilder.GetPublishTopic(PublishTopics.PlatformFile(platform.Id, toAssetId(platform.Background))), platform.Background);
      }
      if (!string.IsNullOrEmpty(platform.Icon))
      {
        yield return publishFile(topicBuilder.GetPublishTopic(PublishTopics.PlatformFile(platform.Id, toAssetId(platform.Icon))), platform.Icon);
      }
    }
  }
}
