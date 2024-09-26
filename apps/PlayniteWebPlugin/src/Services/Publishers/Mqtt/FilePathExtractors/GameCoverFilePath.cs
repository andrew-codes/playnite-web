using Playnite.SDK.Models;

namespace PlayniteWeb.Services.Publishers.Mqtt
{
  internal class GameCoverFilePath: IGetFilePath
  {
    readonly IIdentifiable item;

    public GameCoverFilePath(IIdentifiable item) {
      this.item = item;
    }

    public string getFilePath()
    {
      var game = item as Release;

      return game?.CoverImage;
    }
  }
}
