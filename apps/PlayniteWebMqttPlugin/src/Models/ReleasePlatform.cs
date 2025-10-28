using Playnite.SDK.Models;

namespace PlayniteWebMqtt.Models
{
    public class ReleasePlatform
    {
        public Playnite.SDK.Models.Game Game { get; protected set; }
        public Platform Platform { get; protected set; }

        public ReleasePlatform(Playnite.SDK.Models.Game game, Platform platform)
        {
            this.Game = game;
            this.Platform = platform;
        }
    }
}
