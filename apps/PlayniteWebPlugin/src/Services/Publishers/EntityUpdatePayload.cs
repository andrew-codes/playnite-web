using Playnite.SDK.Models;

namespace PlayniteWeb.Services.Publishers
{
  enum EntityUpdateAction
  {
    Update,
    Delete
  }
  internal class EntityUpdatePayload<T> where T: IIdentifiable
  {
    public EntityUpdatePayload(EntityUpdateAction action)
    {
      Action = action.ToString().ToLower();
    }

    public string Action { get; private set; }
    public T Entity
    {
      get; set;
    }
  }
}
