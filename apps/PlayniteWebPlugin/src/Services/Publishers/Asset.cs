using MQTTnet.Protocol;
using Playnite.SDK;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers
{
  public class Asset
  {
    private string filePath;
    private byte[] data;

    public byte[] Data => data;

    public Asset(IGameDatabaseAPI api, string filePath) {
      this.filePath = api.GetFullFilePath(filePath);

      using (var fileStream = File.OpenRead(this.filePath))
      {
        var result = new byte[fileStream.Length];
        fileStream.Read(result, 0, result.Length);
        this.data = result;
      }
    }
  }
}
