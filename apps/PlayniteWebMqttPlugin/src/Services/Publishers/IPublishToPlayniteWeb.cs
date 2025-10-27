using Playnite.SDK.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PlayniteWebMqtt.Services.Publishers
{
  public interface IPublishToPlayniteWeb
  {
    IEnumerable<Task> Publish(IIdentifiable gameEntity);
  }
}
