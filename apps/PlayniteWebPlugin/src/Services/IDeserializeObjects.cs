using System.Dynamic;

namespace PlayniteWeb.Services
{
  public interface IDeserializeObjects
  {
    ExpandoObject Deserialize(string data);
  }
}
