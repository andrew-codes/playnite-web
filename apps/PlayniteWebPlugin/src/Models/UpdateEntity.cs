using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlayniteWeb.Models
{
  internal class UpdateEntity
  {
    public string EntityType { get; set; }
    public Guid EntityId { get; set; }

    public string UpdateAction { get; set; }

    public IDictionary<string, object> Entity { get; set; }
  }
}
