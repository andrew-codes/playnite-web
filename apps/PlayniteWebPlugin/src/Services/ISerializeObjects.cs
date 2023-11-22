namespace PlayniteWeb.Services
{
  public interface ISerializeObjects
  {
    string Serialize<T>(T data);
  }
}
