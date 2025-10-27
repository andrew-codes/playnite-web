using Playnite.SDK.Models;

namespace PlayniteWebMqtt.Services.Publishers.Mqtt
{
  internal class GameBackgroundFilePath: IGetFilePath
  {
    readonly IIdentifiable item;

    public GameBackgroundFilePath(IIdentifiable item) {
      this.item = item;
    }

    public string getFilePath()
    {
      var game = item as Game;

      return game?.BackgroundImage;
    }
  }
}
