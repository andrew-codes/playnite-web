using MQTTnet.Client;
using MQTTnet.Protocol;
using Playnite.SDK;
using Playnite.SDK.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.Mqtt
{
  internal class PublishAsset : IPublishToPlayniteWeb
  {
    private readonly IMqttClient client;
    private readonly IGameDatabaseAPI gameDatabase;
    private readonly string filePath;
    private readonly string rootTopic;
    private readonly AssetType typeKey;

    public PublishAsset(IMqttClient client, IGameDatabaseAPI gameDatabase, string filePath, string rootTopic, AssetType typeKey)
    {
      this.client = client;
      this.filePath = filePath;
      this.gameDatabase = gameDatabase;
      this.rootTopic = rootTopic;
      this.typeKey = typeKey;
    }

    private string toAssetId(string assetFilePath)
    {
      return assetFilePath.Split('\\').Last();
    }

    public IEnumerable<Task> Publish(IIdentifiable asset)
    {
      if (!client.IsConnected)
      {
        yield break;
      }

      if (string.IsNullOrEmpty(filePath))
      {
        yield break;
      }

      var fullPath = gameDatabase.GetFullFilePath(filePath);
      if (!File.Exists(fullPath))
      {
        yield break;
      }

      using (var fileStream = File.OpenRead(fullPath))
      {
        var result = new byte[fileStream.Length];
        fileStream.Read(result, 0, result.Length);

        string topic = $"{rootTopic}/asset/{toAssetId(filePath)}/type/{Enum.GetName(typeof(AssetType), typeKey)}";
        yield return client.PublishBinaryAsync(
            topic,
            result,
            retain: false,
            qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce,
            cancellationToken: default);
      }
    }
  }
}
