using System.Collections.Generic;

namespace PlayniteWeb.Models
{

  internal class BatchMessage
  {
    public IList<Message> Messages { get; set; } = new List<Message>();
  }
}
