using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace PlayniteWeb.Services
{
  public class ObjectSerializer : ISerializeObjects
  {
    private readonly JsonSerializer serializer;

    public ObjectSerializer() => serializer = new JsonSerializer() { ContractResolver = new CamelCasePropertyNamesContractResolver() };

    public string Serialize<T>(T data)
    {
      using (var outStream = new StringWriter())
      using (var writer = new JsonTextWriter(outStream))
      {
        serializer.Serialize(writer, data);
        return outStream.ToString();
      }
    }
  }
}
