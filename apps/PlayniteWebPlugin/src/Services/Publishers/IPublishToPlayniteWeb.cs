using Playnite.SDK.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers
{
  public interface IPublishToPlaynite
  {
    IEnumerable<Task> Publish(IIdentifiable gameEntity);
  }
}
