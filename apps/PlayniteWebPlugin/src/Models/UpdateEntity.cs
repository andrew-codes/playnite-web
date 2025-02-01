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
    public string EntityTypeName { get; set; }
    public string EntityId { get; set; }

    public IDictionary<string, object> Fields { get; set; }
  }
}
