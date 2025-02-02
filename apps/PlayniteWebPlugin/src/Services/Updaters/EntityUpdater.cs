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
            entity.OnPropertyChanged(field.Key);
          }
          else if (property.PropertyType == typeof(string))
          {
            property.SetValue(entity, field.Value.ToString());
            entity.OnPropertyChanged(field.Key);
          }
          else if (property.PropertyType == typeof(int) || property.PropertyType == typeof(Nullable<int>))
          {
            property.SetValue(entity, int.Parse(field.Value.ToString()));
            entity.OnPropertyChanged(field.Key);
          }
          else if (property.PropertyType == typeof(bool) || property.PropertyType == typeof(Nullable<bool>))
          {
            property.SetValue(entity, bool.Parse(field.Value.ToString()));
            entity.OnPropertyChanged(field.Key);
          }
          else if (property.PropertyType == typeof(DateTime) || property.PropertyType == typeof(Nullable<DateTime>))
          {
            property.SetValue(entity, DateTime.Parse(field.Value.ToString()));
            entity.OnPropertyChanged(field.Key);
          }
          else
          {
            var updateValues = ((JsonElement)field.Value).Deserialize<IDictionary<string, IEnumerable<string>>>();
            var addedValues = updateValues["added"].Distinct();
            var removedValues = updateValues["removed"].Distinct();


            if (property.PropertyType == typeof(List<Guid>))
            {
              var addedIds = addedValues.Select(v => Guid.Parse(v)).ToList();
              var removedIds = removedValues.Select(v => Guid.Parse(v)).ToList();

              if (entity.GetType() == typeof(Game))
              {
                var game = entity as Game;
                if (field.Key == "FeatureIds")
                {
                  foreach (var guid in addedIds)
                  {
                    game.FeatureIds.Add(guid);
                    game.Features.Add(api.Database.Features.FirstOrDefault(f => f.Id.Equals(guid)));
                  }
                  foreach (var guid in removedIds)
                  {
                    game.FeatureIds.Remove(guid);
                    game.Features.Remove(api.Database.Features.FirstOrDefault(f => f.Id.Equals(guid)));
                  }

                  entity.OnPropertyChanged(field.Key);
                  entity.OnPropertyChanged("Features");
                }
              }
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
