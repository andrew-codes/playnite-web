using Playnite.SDK.Models;
using PlayniteWebMqtt.Models;

namespace PlayniteWebMqtt.Services.Publishers.Mqtt
{
  internal class GameCoverFilePath: IGetFilePath
  {
    readonly IIdentifiable item;

    public GameCoverFilePath(IIdentifiable item) {
      this.item = item;
    }

    public string getFilePath()
    {
      var game = item as ReleasePlatform;

      return game?.CoverImage;
    }
  }
}
