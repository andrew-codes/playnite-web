using PlayniteWeb.Models;
using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;

namespace PlayniteWeb
{
  public class PendingUpdate
  {
    public string Source { get; protected set; }
    public Guid Id { get; protected set; }
    public ConcurrentDictionary<string, FieldUpdateValues> Fields { get; protected set; }

    public PendingUpdate(string source, Guid id, ConcurrentDictionary<string, FieldUpdateValues> fields)
    {
      Source = source;
      Id = id;
      Fields = fields;
    }
  }
}
