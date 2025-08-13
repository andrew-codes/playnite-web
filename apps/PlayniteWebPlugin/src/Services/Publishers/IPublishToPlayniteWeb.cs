using Playnite.SDK.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers
{
  public interface IPublishToPlayniteWeb<in T> where T : IIdentifiable
  {
    IEnumerable<Task> Publish(IEnumerable<T> entities);
  }

  public interface IPublishCollectionsToPlayniteWeb<in T> where T : IIdentifiable
  {
    IEnumerable<Task> Publish(IEnumerable<T> added, IEnumerable<T> removed);
  }
}
