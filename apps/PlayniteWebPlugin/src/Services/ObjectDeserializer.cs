using Playnite.SDK;
using System;
using System.Text.Json;

namespace PlayniteWeb.Services
{
  public class ObjectDeserializer : IDeserializeObjects
  {

    public T Deserialize<T>(string data)
    {
      var options = new JsonSerializerOptions(JsonSerializerDefaults.General)
      {
        Converters = { new TypeConverter() }
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
