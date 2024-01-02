using MQTTnet.Client;
using MQTTnet.Protocol;
using Playnite.SDK;
using Playnite.SDK.Models;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.Mqtt
{
  internal class PublishAsset : IPublishToPlaynite
  {
    private readonly IMqttClient client;
    private readonly IGameDatabaseAPI gameDatabase;
    private readonly string filePath;
    private readonly string rootTopic;

    public PublishAsset(IMqttClient client, IGameDatabaseAPI gameDatabase, string filePath, string rootTopic)
    {
      this.client = client;
      this.filePath = filePath;
      this.gameDatabase = gameDatabase;
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

        var topic = $"{rootTopic}/asset/{toAssetId(filePath)}";
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
