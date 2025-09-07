using Playnite.SDK.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.GraphQL
{
  public class OnlyPublishAfterSync : IPublishToPlayniteWeb<IIdentifiable>
  {
    private readonly PlayniteWebSettings settings;
    private readonly IPublishToPlayniteWeb<IIdentifiable> impl;

    public OnlyPublishAfterSync(PlayniteWebSettings settings, IPublishToPlayniteWeb<IIdentifiable> impl)
    {
      this.settings = settings;
      this.impl = impl;
    }

    public IEnumerable<Task> Publish(IEnumerable<IIdentifiable> entities)
    {
      if (settings.LastPublish == null)
      {
        yield break;
      }

      foreach (var t in impl.Publish(entities))
      {
        if (t != null)
        {
          yield return t;
        }
      }
    }
  }

  public class OnlyPublishCollectionAfterSync : IPublishCollectionsToPlayniteWeb<IIdentifiable>
  {
    private readonly PlayniteWebSettings settings;
    private readonly IPublishCollectionsToPlayniteWeb<IIdentifiable> impl;

    public OnlyPublishCollectionAfterSync(PlayniteWebSettings settings, IPublishCollectionsToPlayniteWeb<IIdentifiable> impl)
    {
      this.settings = settings;
      this.impl = impl;
    }

    public IEnumerable<Task> Publish(IEnumerable<IIdentifiable> added, IEnumerable<IIdentifiable> removed)
    {
      if (settings.LastPublish == null)
      {
        yield break;
      }
      foreach (var t in impl.Publish(added, removed))
      {
        if (t != null)
        {
          yield return t;
        }
      }
    }
  }
}
