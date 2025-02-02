using Playnite.SDK;
using Playnite.SDK.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace PlayniteWeb.Services.Updaters
{
  internal class EntityUpdater
  {
    private readonly ILogger logger;

    public EntityUpdater()
    {
      logger = LogManager.GetLogger();
    }

    public TEntityType Update<TEntityType>(TEntityType entity, IDictionary<string, object> values) where TEntityType : DatabaseObject, IIdentifiable
    {
      foreach (var field in values)
      {
        try
        {
          if (field.Key == "Id" || field.Key == "Name")
          {
            logger.Warn($"Field {field.Key} is not updatable.");
            continue;
          }

          var property = entity.GetType().GetProperty(field.Key);
          if (property == null)
          {
            logger.Debug($"Property {field.Key} not found on entity {typeof(TEntityType).Name} with ID {((IIdentifiable)entity).Id}.");
            continue;
          }

          if (field.Value == null)
          {
            logger.Debug($"Property {field.Key} not found on entity {typeof(TEntityType).Name} with ID {((IIdentifiable)entity).Id}.");
            continue;
          }

          if (property.PropertyType == typeof(Guid) || property.PropertyType == typeof(Nullable<Guid>))
          {
            property.SetValue(entity, Guid.Parse(field.Value.ToString()));
          }
          else if (property.PropertyType == typeof(string))
          {
            property.SetValue(entity, field.Value.ToString());
          }
          else if (property.PropertyType == typeof(int) || property.PropertyType == typeof(Nullable<int>))
          {
            property.SetValue(entity, int.Parse(field.Value.ToString()));
          }
          else if (property.PropertyType == typeof(bool) || property.PropertyType == typeof(Nullable<bool>))
          {
            property.SetValue(entity, bool.Parse(field.Value.ToString()));
          }
          else if (property.PropertyType == typeof(DateTime) || property.PropertyType == typeof(Nullable<DateTime>))
          {
            property.SetValue(entity, DateTime.Parse(field.Value.ToString()));
          }
          else if (property.PropertyType == typeof(List<Guid>))
          {
            property.SetValue(entity, ((IEnumerable<object>)field.Value).Select(v => v.ToString()).Select(Guid.Parse).ToList());
          }
          else if (property.PropertyType == typeof(List<string>))
          {
            property.SetValue(entity, ((IEnumerable<object>)field.Value).Select(v => v.ToString()).ToList());
          }
          else if (property.PropertyType == typeof(List<int>))
          {
            property.SetValue(entity, ((IEnumerable<object>)field.Value).Select(v => v.ToString()).Select(int.Parse).ToList());
          }
          else if (property.PropertyType == typeof(List<bool>))
          {
            property.SetValue(entity, ((IEnumerable<object>)field.Value).Select(v => v.ToString()).Select(bool.Parse).ToList());
          }
          else if (property.PropertyType == typeof(List<DateTime>))
          {
            property.SetValue(entity, ((IEnumerable<object>)field.Value).Select(v => v.ToString()).Select(DateTime.Parse).ToList());
          }

          entity.OnPropertyChanged(field.Key);
        }
        catch (Exception ex)
        {
          logger.Error(ex, $"Error occurred in Subscriber_OnUpdateEntity for Entity ID {((IIdentifiable)entity).Id}. Could not process property {field.Key}");
        }
      }

      return entity;
    }
  }
}
