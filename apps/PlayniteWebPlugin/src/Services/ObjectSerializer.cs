using Playnite.SDK;
using System;
using System.Text.Json;

namespace PlayniteWeb.Services
{
  public class ObjectSerializer : ISerializeObjects
  {
    public string Serialize(object data)
    {
      try
      {
        return JsonSerializer.Serialize(data, new JsonSerializerOptions(JsonSerializerDefaults.Web));
      }
      catch (Exception error)
      {
        LogManager.GetLogger().Error($"Serializing {data} - {error.ToString()}");
        throw error;
      }
    }
  }
}
