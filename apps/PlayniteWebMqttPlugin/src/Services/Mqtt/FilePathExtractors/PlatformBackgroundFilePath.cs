using Playnite.SDK.Models;

namespace PlayniteWebMqtt.Services.Publishers.Mqtt
{
  internal class PlatformBackgroundFilePath: IGetFilePath
  {
    readonly IIdentifiable item;

    public PlatformBackgroundFilePath(IIdentifiable item) {
      this.item = item;
    }

    public string getFilePath()
    {
      var platform = item as Platform;

      return platform?.Background;
    }
  }
}
