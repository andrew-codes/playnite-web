using System.Collections.Generic;
using System;
using Playnite.SDK.Models;
using Playnite.SDK;
using System.Linq;

namespace PlayniteWeb
{
  internal class EventHandlers
  {
    private readonly IDictionary<Type, EventHandler> itemUpdateHandlers;
    private readonly IDictionary<Type, EventHandler> collectionUpdateHandlers;


    public EventHandlers()
    {
      itemUpdateHandlers = new Dictionary<Type, EventHandler>();
      collectionUpdateHandlers = new Dictionary<Type, EventHandler>();
    }

    public EventHandler<ItemUpdatedEventArgs<TItem>> RegisterItemUpdateHandler<TItem>(EventHandler<ItemUpdatedEventArgs<DatabaseObject>> h) where TItem : DatabaseObject
    {
      EventHandler<ItemUpdatedEventArgs<TItem>> handler = (object sender, ItemUpdatedEventArgs<TItem> e) => h(sender, new ItemUpdatedEventArgs<DatabaseObject>(e.UpdatedItems.Select(item => new ItemUpdateEvent<DatabaseObject>(item.OldData, item.NewData))));

      itemUpdateHandlers.Add(typeof(TItem), handler as EventHandler);

      return handler;
    }

    public EventHandler<ItemUpdatedEventArgs<tItem>> GetItemUpdateHandler<tItem>() where tItem : DatabaseObject
    {
      return itemUpdateHandlers[typeof(tItem)] as EventHandler<ItemUpdatedEventArgs<tItem>>;
    }

    public EventHandler<ItemCollectionChangedEventArgs<TItem>> RegisterCollectionUpdateHandler<TItem>(EventHandler<ItemCollectionChangedEventArgs<DatabaseObject>> h) where TItem : DatabaseObject
    {
      EventHandler<ItemCollectionChangedEventArgs<TItem>> handler = (object sender, ItemCollectionChangedEventArgs<TItem> e) => h(sender, new ItemCollectionChangedEventArgs<DatabaseObject>(e.AddedItems.Cast<DatabaseObject>().ToList(), e.RemovedItems.Cast<DatabaseObject>().ToList()));

      collectionUpdateHandlers.Add(typeof(TItem), handler as EventHandler);

      return handler;
    }

    public EventHandler<ItemCollectionChangedEventArgs<TItem>> GetCollectionUpdateHandler<TItem>() where TItem : DatabaseObject
    {
      return collectionUpdateHandlers[typeof(TItem)] as EventHandler<ItemCollectionChangedEventArgs<TItem>>;
    }

  }
}
