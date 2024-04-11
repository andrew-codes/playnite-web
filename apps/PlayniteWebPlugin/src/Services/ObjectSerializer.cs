using System.Text.Json;

namespace PlayniteWeb.Services
{
  public class ObjectSerializer : ISerializeObjects
  {
    public string Serialize(object data)
    {
      return JsonSerializer.Serialize(data, new JsonSerializerOptions(JsonSerializerDefaults.Web));
    }
  }
}
