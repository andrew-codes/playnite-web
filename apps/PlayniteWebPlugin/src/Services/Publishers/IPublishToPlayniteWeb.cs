using Playnite.SDK.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers
{
  public interface IPublishToPlayniteWeb
  {
    IEnumerable<Task> Publish(IIdentifiable gameEntity);
  }
}
