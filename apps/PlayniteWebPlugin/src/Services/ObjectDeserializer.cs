using Playnite.SDK;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Globalization;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PlayniteWeb.Services
{
  public class PascalCaseJsonConverter : JsonConverter<ExpandoObject>
  {
    public override ExpandoObject Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
      using (JsonDocument doc = JsonDocument.ParseValue(ref reader))
      {
        var jsonObject = doc.RootElement;
        if (jsonObject.ValueKind == JsonValueKind.Object)
        {
          var result = new ExpandoObject() as IDictionary<string, object>;
          foreach (var prop in jsonObject.EnumerateObject())
          {
            var name = ConvertToPascalCase(prop.Name);
            using (JsonDocument valueDoc = JsonDocument.Parse(prop.Value.GetRawText()))
            {
              dynamic value = null;
              if (valueDoc.RootElement.ValueKind == JsonValueKind.Object)
              {
                value = JsonSerializer.Deserialize<ExpandoObject>(prop.Value.GetRawText(), options);
              }
              else if (valueDoc.RootElement.ValueKind == JsonValueKind.Array)
              {
                var list = new List<dynamic>();
                foreach (var valueItem in valueDoc.RootElement.EnumerateArray())
                {
                  list.Add(JsonSerializer.Deserialize<ExpandoObject>(valueItem.GetRawText(), options));

                }
                value = list;
              }
              else if (valueDoc.RootElement.ValueKind == JsonValueKind.String)
              {
                value = valueDoc.RootElement.GetString();
              }
              else if (valueDoc.RootElement.ValueKind == JsonValueKind.Number)
              {
                value = valueDoc.RootElement.GetInt32();
              }
              else if (valueDoc.RootElement.ValueKind == JsonValueKind.True || valueDoc.RootElement.ValueKind == JsonValueKind.False)
              {
                value = valueDoc.RootElement.GetBoolean();
              }
              else
              {
                value = valueDoc.RootElement.GetRawText();
              }

              result[name] = value;
            }
          }
          return result as ExpandoObject;
        }

        return null;
      }
    }

    public override void Write(Utf8JsonWriter writer, ExpandoObject value, JsonSerializerOptions options)
    {
      JsonSerializer.Serialize(writer, value, options);
    }

    private string ConvertToPascalCase(string name)
    {
      if (string.IsNullOrEmpty(name))
        return name;

      return char.ToUpper(name[0], CultureInfo.InvariantCulture) + name.Substring(1);
    }
  }

  public class ObjectDeserializer : IDeserializeObjects
  {

    public ExpandoObject Deserialize(string data)
    {
      try
      {
        var options = new JsonSerializerOptions
        {
          PropertyNameCaseInsensitive = true, // Allows case-insensitive matches
          Converters = { new PascalCaseJsonConverter() } // Apply custom converter
        };
        return JsonSerializer.Deserialize<ExpandoObject>(data, options);
      }
      catch (NotSupportedException nse)
      {
        // Specific catch for NotSupportedException to handle serialization issues more specifically
        LogManager.GetLogger().Error($"Unsupported serialization attempt for {data.GetType()}: {nse.Message}");
        throw;
      }
      catch (Exception error)
      {
        // General exception handling
        LogManager.GetLogger().Error($"Error serializing object: {error}");
        throw;
      }
    }
  }
}
