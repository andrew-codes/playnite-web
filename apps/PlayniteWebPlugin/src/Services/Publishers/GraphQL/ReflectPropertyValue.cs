using Playnite.SDK.Models;
using System;

namespace PlayniteWeb.Services.Publishers.GraphQL
{
  public static class ReflectPropertyValue
  {
    public static object GetValue(this IIdentifiable subject, string propertyName)
    {
      var property = subject.GetType().GetProperty(propertyName);
      var propertyValue = property?.GetValue(subject);
      if (propertyValue == null)
      {
        return null;
      }

      if (propertyValue.GetType() == typeof(DateTime))
      {
        return ((DateTime)propertyValue).ToString("yyyy-MM-ddTHH:mm:ss.fffZ", System.Globalization.CultureInfo.InvariantCulture);
      }

      if (propertyValue.GetType() == typeof (DateTime?))
      {
               var dateTimeValue = (DateTime?)propertyValue;
        return dateTimeValue.HasValue
          ? dateTimeValue.Value.ToString("yyyy-MM-ddTHH:mm:ss.fffZ", System.Globalization.CultureInfo.InvariantCulture)
          : null;
      }

      if (propertyValue.GetType() == typeof(ulong))
      {
        return ((ulong)propertyValue).ToString();
      }

      return propertyValue;
    }
  }
}
