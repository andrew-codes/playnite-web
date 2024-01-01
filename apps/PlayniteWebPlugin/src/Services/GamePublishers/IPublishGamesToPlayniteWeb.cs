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

    event EventHandler<Task> LibraryRefreshRequest;

    IEnumerable<Task> PublishGames(IEnumerable<Game> game);
    IEnumerable<Task> PublishLibrary();
    IEnumerable<Task> PublishGameRelationships();
  }
}
