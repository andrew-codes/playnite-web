using Playnite.SDK;
using Playnite.SDK.Models;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace PlayniteWeb.Services.Updaters
{
  internal class EntityUpdater
  {
    private readonly ILogger logger;
    private readonly IPlayniteAPI api;

    public EntityUpdater(IPlayniteAPI api)
    {
      logger = LogManager.GetLogger();
      this.api = api;
    }

    public TEntityType Update<TEntityType>(TEntityType entity, dynamic values) where TEntityType : DatabaseObject, IIdentifiable
    {
      var fields = values as IDictionary<string, object>;
      foreach (var field in fields)
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
            logger.Debug($"Property {field.Key} not found on entity {typeof(TEntityType).Name} with ID {entity.Id}.");
            continue;
          }

          if (field.Value == null)
          {
            logger.Debug($"Property {field.Key} not found on entity {typeof(TEntityType).Name} with ID {entity.Id}.");
            continue;
          }

          if (property.PropertyType == typeof(Guid) || property.PropertyType == typeof(Nullable<Guid>))
          {
            var value = Guid.Parse(field.Value.ToString());
            var propertyValue = (Guid)property.GetValue(entity);
            if (propertyValue == null || propertyValue.Equals(value))
            {
              continue;
            }
            property.SetValue(entity, value);
          }
          else if (property.PropertyType == typeof(string))
          {
            var value = field.Value.ToString();
              var propertyValue = property.GetValue(entity) as string;
            if (propertyValue == null || propertyValue.Equals(value))
            {
              continue;
            }
            property.SetValue(entity, value);
          }
          else if (property.PropertyType == typeof(int) || property.PropertyType == typeof(Nullable<int>))
          {
            var value = int.Parse(field.Value.ToString());
            var propertyValue = (int?)property.GetValue(entity);
            if (propertyValue == null || propertyValue.Equals(value))
            {
              continue;
            }
            property.SetValue(entity, value);
          }
          else if (property.PropertyType == typeof(bool) || property.PropertyType == typeof(Nullable<bool>))
          {
            var value = bool.Parse(field.Value.ToString());
            var propertyValue = (bool?)property.GetValue(entity);
            if (propertyValue == null || propertyValue.Equals(value))
            {
              continue;
            }
            property.SetValue(entity, value);
          }
          else if (property.PropertyType == typeof(DateTime) || property.PropertyType == typeof(Nullable<DateTime>))
          {
            var value = DateTime.Parse(field.Value.ToString());
            var propertyValue = (DateTime?)property.GetValue(entity);
            if (propertyValue == null || propertyValue.Equals(value))
            {
              continue;
            }
            property.SetValue(entity, value);
          }
          else
          {
            if (property.PropertyType == typeof(List<Guid>))
            {
              if (entity is Game game)
              {
                if (field.Key == "FeatureIds" && field.Value is IEnumerable<string> ids)
                {
                  var relatedIds = ids.Select(Guid.Parse).ToList();
                  var relatedEntities = api.Database.Features.Where(f => relatedIds.Contains(f.Id)).ToList();
                  game.FeatureIds.Clear();
                  game.Features.Clear();

                  foreach (var guid in relatedIds)
                  {
                    game.FeatureIds.Add(guid);
                    game.Features.Add(relatedEntities.FirstOrDefault(f => f.Id.Equals(guid)));
                  }
                }
              }
            }
          }
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
