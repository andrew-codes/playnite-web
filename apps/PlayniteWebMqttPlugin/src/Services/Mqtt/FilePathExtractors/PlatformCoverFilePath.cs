using Playnite.SDK.Models;

namespace PlayniteWebMqtt.Services.Publishers.Mqtt
{
  internal class PlatformCoverFilePath: IGetFilePath
  {
    readonly IIdentifiable item;

    public PlatformCoverFilePath(IIdentifiable item) {
      this.item = item;
    }

    public string getFilePath()
    {
      var platform = item as Platform;

      return platform?.Cover;
    }
  }
}
