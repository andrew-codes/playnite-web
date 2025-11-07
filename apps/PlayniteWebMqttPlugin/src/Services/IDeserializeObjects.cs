using System.Dynamic;

namespace PlayniteWebMqtt.Services
{
  public interface IDeserializeObjects
  {
    ExpandoObject Deserialize(string data);
  }
}
