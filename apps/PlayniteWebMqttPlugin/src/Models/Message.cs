using Playnite.SDK.Models;

namespace PlayniteWebMqtt.Models
{
  public class Message
  {
    public string Topic { get; set; }
    public string Payload { get; set; }
  }
}
