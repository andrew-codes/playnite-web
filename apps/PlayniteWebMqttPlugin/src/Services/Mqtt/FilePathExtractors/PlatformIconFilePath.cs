using Playnite.SDK.Models;

namespace PlayniteWebMqtt.Services.Publishers.Mqtt
{
  internal class PlatformIconFilePath: IGetFilePath
  {
    readonly IIdentifiable item;

    public PlatformIconFilePath(IIdentifiable item) {
      this.item = item;
    }

    public string getFilePath()
    {
      var platform = item as Platform;

      return platform?.Icon;
    }
  }
}
