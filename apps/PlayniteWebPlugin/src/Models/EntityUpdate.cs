using Playnite.SDK;
using Playnite.SDK.Models;
using PlayniteWeb.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace PlayniteWeb.Models
{
  public interface IUpdateEntityField
  {
    IIdentifiable Update(IIdentifiable entity);
  }

  public interface IParseToFieldValue
  {
    object Parse(PropertyInfo type, string value);
  }

  public class FieldUpdateValues
  {
    public string Key { get; set; }
    public Guid? PlayniteId { get;  set; }
    public List<Guid> PlayniteIds { get; protected set; }
    public string Value { get; set; }

    public FieldUpdateValues(dynamic field)
    {
      if (Guid.TryParse(field.playniteId?.ToString(), out Guid playniteId))
      {
        PlayniteId = playniteId;
      }

      if (field.playniteIds == null)
      {
        PlayniteIds = new List<Guid>();
      }
      else
      {
        PlayniteIds = new List<Guid>(GetPlayniteIds(field.playniteIds));
      }
      Value = field.value?.ToString();

      Key= field.key?.ToString();
    }

    private IEnumerable<Guid> GetPlayniteIds(dynamic playniteIds)
    {
      foreach (var playniteId in playniteIds)
      {
        if (Guid.TryParse(playniteId.ToString(), out Guid id))
        {
          yield return id;
        }
      }
    }
  }


  public class EntityUpdate : IUpdateEntityField
  {
    private readonly IDictionary<string, Type> allowedFieldUpdates;

    private readonly ILogger _logger = LogManager.GetLogger();

    protected string Type { get; set; }
    public Guid? Id { get; protected set; }

    public IEnumerable<FieldUpdateValues> Fields {get; protected set;}

    public EntityUpdate(dynamic update, IDictionary<string, Type> allowedFieldUpdates)
    {
      Type = update.type.ToString();

      Fields = GetFields(update.fields);
      if (Guid.TryParse(update.playniteId.ToString(), out Guid id))
      {
        Id = id;
      }

      this.allowedFieldUpdates = allowedFieldUpdates;
    }

    private IEnumerable<FieldUpdateValues> GetFields(dynamic fields)
    {
      foreach(var field in fields)
      {
        yield return new FieldUpdateValues(field);
      }
    }

    public IIdentifiable Update(IIdentifiable entity)
    {
      if (!Id.HasValue)
      {
        throw new ArgumentException("PlayniteId has no value or could not be parsed as a Guid.");
      }
      if (string.IsNullOrEmpty(Type))
      {
        throw new ArgumentException("Type is not a valid value.");
      }
      if (!allowedFieldUpdates.ContainsKey(Type))
      {
      throw new ArgumentException($"Updates to ${Type} is currently unsupported.");
      }

      var type = allowedFieldUpdates[Type];
      if (type.GetInterface("IUpdateEntityField") == null)
      {
        throw new Exception($"Could not update entity. Unable to create updater instance for entity.");
      }
      var constructor = type.GetConstructor(new Type[] { typeof(string), typeof(FieldUpdateValues), typeof(FieldValueParser) });
      var e = entity;
      foreach(var field in Fields)
      {
        try
        {
          var updater = constructor.Invoke(new object[]
          {
            field.Key, field, new FieldValueParser()
          }) as IUpdateEntityField;
          e = updater.Update(e);
        }
        catch (Exception ex)
        {
         _logger.Warn($"Could not update field {field.Key} on entity of type {Type}. Error: {ex.Message}");
        }
      }

      return e;
    }
  }

  public abstract class UpdateField : IUpdateEntityField
  {
    private readonly string fieldKey;
    private readonly FieldUpdateValues values;
    private IParseToFieldValue parser;

    public UpdateField(string fieldKey, FieldUpdateValues values, IParseToFieldValue parser)
    {
      this.fieldKey = GetDatabaseKey(fieldKey);
      this.values = values;
      this.parser = parser;
    }

    protected abstract string GetDatabaseKey(string key);

    public IIdentifiable Update(IIdentifiable entity)
    {
      var field = entity.GetType().GetProperty(fieldKey);
      if (field == null|| !field.CanWrite)
      {
        throw new InvalidOperationException($"Field {fieldKey} is not writeable or unsupported.");
      }

      if (values.PlayniteId == null && values.PlayniteIds.Any())
      {
        field.SetValue(entity, values.PlayniteIds);
        return entity;
      }
      else if (values.PlayniteId != null && !values.PlayniteIds.Any())
      {
        field.SetValue(entity, values.PlayniteId);
        return entity;
      }
      else if (!string.IsNullOrEmpty(values.Value))
      {
        var value = parser.Parse(field, values.Value);
        field.SetValue(entity, value);
        return entity;
      }

      throw new ArgumentException($"Unable to set value for {fieldKey} on {entity.GetType().Name}. No valid values set for value, playniteId, or playniteIds.");
    }
  }
}

public class ReleaseFieldUpdate : UpdateField
{
  public ReleaseFieldUpdate(string fieldKey, FieldUpdateValues values, IParseToFieldValue parser) : base(fieldKey, values, parser)
  {
  }

  protected override string GetDatabaseKey(string key)
  {
    if (key == "completionStatus")
    {
      return "CompletionStatusId";
    }
    if (key == "platform")
    {
      return "PlatformId";
    }
    if (key == "source")
    {
      return "SourceId";
    }
    if (key == "features")
    {
      return "FeatureIds";
    }
    if (key == "tags")
    {
      return "TagIds";
    }
    if (key == "description")
    {
      return "Description";
    }
    if (key == "title")
    {
      return "Name";
    }
    if (key =="releaseDate")
    {
      return "ReleaseDate";
    }

    throw new ArgumentException($"Field {key} of Games is not supported for updates.");
  }
}


public class FieldValueParser : IParseToFieldValue
{
  public object Parse(PropertyInfo property, string value)
  {
    if (property.PropertyType == typeof(DateTime))
    {
      return DateTime.Parse(value);
    }
    if (property.PropertyType == typeof(ReleaseDate))
    {
      return new ReleaseDate(DateTime.Parse(value));
    }
    if (property.PropertyType== typeof(bool))
    {
      return bool.Parse(value);
    }
    if (property.PropertyType == typeof(int))
    {
      return int.Parse(value);
    }
    if (property.PropertyType == typeof(long))
    {
      return long.Parse(value);
    }
    if (property.PropertyType == typeof(float))
    {
      return float.Parse(value);
    }
    if(property.PropertyType == typeof(double))
    {
      return double.Parse(value);
    }
    if(property.PropertyType == typeof(decimal))
    {
      return decimal.Parse(value);
    }
    if (property.PropertyType == typeof(ulong))
    {
      return ulong.Parse(value);
    }

    return value;
  }
}
