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
      client.ApplicationMessageReceivedAsync += MesssageReceived;

      this.topicBuilder = topicBuilder;
      this.gameDatabase = gameDatabase;
      this.serializer = new ObjectSerializer();
    }

    public event EventHandler<Task> LibraryRefreshRequest;

    public Task PublishGame(Game game)
    {
      if (!client.IsConnected)
      {
        return Task.CompletedTask;
      }

      var publishGameTasks = new List<Task>{
        client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.Game(game.Id)), serializer.Serialize(game), MqttQualityOfServiceLevel.AtLeastOnce, retain: false, cancellationToken: default),
      };
      if (!string.IsNullOrEmpty(game.CoverImage))
      {
        publishGameTasks.Add(publishFile(PublishTopics.GameFile(game.Id, toAssetId(game.CoverImage)), game.CoverImage));
      }
      if (!string.IsNullOrEmpty(game.BackgroundImage))
      {
        publishGameTasks.Add(publishFile(PublishTopics.GameFile(game.Id, toAssetId(game.BackgroundImage)), game.CoverImage));
      }

      return Task.WhenAll(publishGameTasks);
    }

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

    public Task PublishLibrary(IEnumerable<Game> games)
    {
      if (!client.IsConnected)
      {
        return Task.CompletedTask;
      }

      var allTasks = new List<Task>
      {
        client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.LibraryRequesteCompleted()), "start")
      };

      foreach (var platform in games.Where(game => game.Platforms != null).SelectMany(game => game.Platforms).Distinct())
      {
        allTasks.Add(client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.Platform(platform.Id)), serializer.Serialize(platform), retain: false, qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce));

        if (!string.IsNullOrEmpty(platform.Cover))
        {
          allTasks.Add(publishFile(topicBuilder.GetPublishTopic(PublishTopics.PlatformFile(platform.Id, toAssetId(platform.Cover))), platform.Cover));
        }
        if (!string.IsNullOrEmpty(platform.Background))
        {
          allTasks.Add(publishFile(topicBuilder.GetPublishTopic(PublishTopics.PlatformFile(platform.Id, toAssetId(platform.Background))), platform.Background));
        }
        if (!string.IsNullOrEmpty(platform.Icon))
        {
          allTasks.Add(publishFile(topicBuilder.GetPublishTopic(PublishTopics.PlatformFile(platform.Id, toAssetId(platform.Icon))), platform.Icon));
        }
      }

      foreach (var game in games)
      {
        allTasks.Add(PublishGame(game));
      }

      allTasks.Add(client.PublishStringAsync(topicBuilder.GetPublishTopic(PublishTopics.LibraryRequesteCompleted()), "end"));

      return Task.WhenAll(allTasks);
    }
  }
}
