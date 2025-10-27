using Playnite.SDK.Models;
using System;

namespace PlayniteWebMqtt.Services.Publishers
{
  enum EntityUpdateAction
  {
    Update,
    Delete
  }
  internal class EntityUpdatePayload<T> where T: IIdentifiable
  {
    public EntityUpdatePayload(EntityUpdateAction action, string selfDeviceId)
    {
      Action = action.ToString().ToLower();
      From = selfDeviceId;
    }

    public string Action { get; private set; }
    public T Entity
    {
      get; set;
    }
    public string From { get; private set; }
  }
}
