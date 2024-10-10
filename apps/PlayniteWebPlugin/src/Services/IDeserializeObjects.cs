namespace PlayniteWeb.Services
{
  public interface IDeserializeObjects
  {
    T Deserialize<T>(string data);
  }
}
