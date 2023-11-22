using Playnite.SDK.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PlayniteWeb
{
  public interface IPublishGamesToPlayniteWeb<TPublishClient>
  {
    void StartConnection(IApplyPublisherOptions<TPublishClient> options);
    Task StartDisconnect();

    event Func<Task> LibraryRefreshRequest;

    Task PublishGame(Game game);
    Task PublishLibrary(IEnumerable<Game> games);
  }
}
