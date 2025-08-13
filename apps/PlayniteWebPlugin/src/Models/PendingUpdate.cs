using System;
using System.Collections;
using System.Collections.Generic;

namespace PlayniteWeb
{
  public class PendingUpdate
  {
    public string Source { get; protected set; }
    public Guid Id { get; protected set; }
    public IDictionary<string, string> Feilds { get; protected set; }

    public PendingUpdate(string source, Guid id, IDictionary<string, string> feilds)
    {
      Source = source;
      Id = id;
      Feilds = feilds;
    }
  }
}
