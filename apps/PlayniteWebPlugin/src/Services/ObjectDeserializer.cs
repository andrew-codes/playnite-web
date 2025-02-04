using Playnite.SDK;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PlayniteWeb.Services
{

  public class ListJsonConverter<T> : JsonConverter<List<T>>
  {
    public override List<T> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
      if (reader.TokenType != JsonTokenType.StartArray)
      {
        throw new JsonException();
      }

      var list = new List<T>();

      while (reader.Read())
      {
        if (reader.TokenType == JsonTokenType.EndArray)
        {
          return list;
        }

        var item = JsonSerializer.Deserialize<T>(ref reader, options);
        list.Add(item);
      }

      throw new JsonException();
    }

    public override void Write(Utf8JsonWriter writer, List<T> value, JsonSerializerOptions options)
    {
      JsonSerializer.Serialize(writer, value, options);
    }
  }

  public class ObjectDeserializer : IDeserializeObjects
  {

    public T Deserialize<T>(string data)
    {
      var options = new JsonSerializerOptions(JsonSerializerDefaults.General)
      {
        Converters = { new TypeConverter(), new ListJsonConverter<string>() }
      };

      try
      {
        // Use the custom options with the TypeConverter
        return JsonSerializer.Deserialize<T>(data, options);
      }
      catch (NotSupportedException nse)
      {
        // Specific catch for NotSupportedException to handle serialization issues more specifically
        LogManager.GetLogger().Error($"Unsupported serialization attempt for {data.GetType()}: {nse.Message}");
        throw;
      }
      catch (Exception error)
      {
        // General exception handling
        LogManager.GetLogger().Error($"Error serializing object: {error}");
        throw;
      }
    }
  }
}
