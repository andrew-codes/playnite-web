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
      this.topicBuilder = topicBuilder;
      this.gameDatabase = gameDatabase;
    }

    public event Func<Task> LibraryRefreshRequest;

    public Task PublishGame(Game game)
    {
      var publishGameTasks = new Task[]{
        client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.Game(game.Id)), serializer.Serialize(game), MqttQualityOfServiceLevel.AtLeastOnce, retain: false, cancellationToken: default),
        publishFile(PublishTopics.PlatformFile(game.Id, toAssetId(game.CoverImage)), game.CoverImage),
        publishFile(PublishTopics.PlatformFile(game.Id, toAssetId(game.BackgroundImage)), game.BackgroundImage),
      };
      var publishGamePlatformTasks = game.Platforms.SelectMany(platform => new Task[] {
        client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.Platform(platform.Id)), serializer.Serialize(platform), MqttQualityOfServiceLevel.AtLeastOnce, retain: false, cancellationToken: default),
        publishFile(PublishTopics.PlatformFile(platform.Id, toAssetId(platform.Cover)), platform.Cover),
        publishFile(PublishTopics.PlatformFile(platform.Id, toAssetId(platform.Background)), platform.Background),
        publishFile(PublishTopics.PlatformFile(platform.Id, toAssetId(platform.Icon)), platform.Icon),
      });

      var allTasks = publishGameTasks
        .Concat(publishGamePlatformTasks);

      return Task.WhenAll(allTasks);
    }

    private string toAssetId(string assetFilePath)
    {
      return assetFilePath.Split('\\').Last();
    }

    private Task publishFile(string topic, string filePath)
    {
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
      client.ApplicationMessageReceivedAsync += MesssageReceived;
      client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.Connection()), "online", MqttQualityOfServiceLevel.AtLeastOnce, retain: false, cancellationToken: default).Wait(cancellationToken: default);
    }

    private Task MesssageReceived(MqttApplicationMessageReceivedEventArgs args)
    {
      if (args.ApplicationMessage.Topic == topicBuilder.GetSubscribeTopic(SubscribeTopics.RequestLibraryPublish))
      {
        return LibraryRefreshRequest.Invoke();
      }

      return Task.CompletedTask;
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

    public Task PublishLibrary(IEnumerable<Game> games)
    {
      var allTasks = new List<Task>
      {
        client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.LibraryRequesteCompleted()), "start")
      };

      foreach (var platform in games.Where(game => game.Platforms != null).SelectMany(game => game.Platforms).Distinct())
      {
        allTasks.Add(client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.Platform(platform.Id)), serializer.Serialize(platform), retain: false, qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce));
        allTasks.Add(publishFile(topicBuilder.GetPublishTopic(PublishTopics.PlatformFile(platform.Id, toAssetId(platform.Cover))), platform.Cover));
        allTasks.Add(publishFile(topicBuilder.GetPublishTopic(PublishTopics.PlatformFile(platform.Id, toAssetId(platform.Background))), platform.Background));
        allTasks.Add(publishFile(topicBuilder.GetPublishTopic(PublishTopics.PlatformFile(platform.Id, toAssetId(platform.Icon))), platform.Icon));
      }

      foreach (var game in games)
      {

        allTasks.Add(client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.Game(game.Id)), serializer.Serialize(game), retain: false, qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce));
        allTasks.Add(publishFile(topicBuilder.GetPublishTopic(PublishTopics.GameFile(game.Id, toAssetId(game.CoverImage))), game.CoverImage));
        allTasks.Add(publishFile(topicBuilder.GetPublishTopic(PublishTopics.GameFile(game.Id, toAssetId(game.BackgroundImage))), game.BackgroundImage));
      }

      allTasks.Add(client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.LibraryRequesteCompleted()), "end"));

      return Task.WhenAll(allTasks);
    }
  }
}
