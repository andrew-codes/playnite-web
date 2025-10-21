using GraphQL;
using GraphQL.Client.Abstractions.Websocket;
using Playnite.SDK;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace PlayniteWeb.Services
{
  internal class GraphSerializer : IGraphQLWebsocketJsonSerializer
  {
    private readonly JsonSerializerOptions _options;

    public GraphSerializer() {
      _options = new JsonSerializerOptions(JsonSerializerDefaults.Web)
      {
        Converters =
        {
          new TypeConverter(),
          new DynamicObjectConverter()
        }
      };
    }

    public Task<GraphQLResponse<TResponse>> DeserializeFromUtf8StreamAsync<TResponse>(Stream stream, CancellationToken cancellationToken)
    {
      return DeserializeFromUtf8Stream<GraphQLResponse<TResponse>>(stream);
    }

    public GraphQLWebSocketResponse<TResponse> DeserializeToWebsocketResponse<TResponse>(byte[] bytes)
    {
      return JsonSerializer.Deserialize<GraphQLWebSocketResponse<TResponse>>(bytes, _options);
    }

    public Task<WebsocketMessageWrapper> DeserializeToWebsocketResponseWrapperAsync(Stream stream)
    {
      return DeserializeFromUtf8Stream<WebsocketMessageWrapper>(stream);
    }

    public byte[] SerializeToBytes(GraphQLWebSocketRequest request)
    {
      try
      {
        return Encoding.UTF8.GetBytes(JsonSerializer.Serialize(request, _options));
      }
      catch (NotSupportedException nse)
            {
        // Specific catch for NotSupportedException to handle serialization issues more specifically
        LogManager.GetLogger().Error($"Unsupported serialization attempt for {request.GetType()}: {nse.Message}");
        throw;
      }
            catch (Exception error)
            {
        // General exception handling
        LogManager.GetLogger().Error($"Error serializing object: {error}");
        throw;
      }
    }

    public string SerializeToString(GraphQLRequest request)
    {
      try
      {
       return  JsonSerializer.Serialize(request, _options);
      }
      catch (NotSupportedException nse)
      {
        // Specific catch for NotSupportedException to handle serialization issues more specifically
        LogManager.GetLogger().Error($"Unsupported serialization attempt for {request.GetType()}: {nse.Message}");
        throw;
      }
      catch (Exception error)
      {
        // General exception handling
        LogManager.GetLogger().Error($"Error serializing object: {error}");
        throw;
      }
    }
    private Task<T> DeserializeFromUtf8Stream<T>(Stream stream)
    {
      using (var sr = new StreamReader(stream))
      {
        var json = sr.ReadToEnd();

        return Task.FromResult(JsonSerializer.Deserialize<T>(Encoding.UTF8.GetBytes(json), _options));
      }
    }

    private class DynamicObjectConverter : JsonConverter<object>
    {
      public override bool CanConvert(Type typeToConvert)
      {
        return typeToConvert == typeof(object);
      }

      public override object Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
      {
        using (var document = JsonDocument.ParseValue(ref reader))
        {
          return ToDynamic(document.RootElement.Clone());
        }
      }

      public override void Write(Utf8JsonWriter writer, object value, JsonSerializerOptions options)
      {
        JsonSerializer.Serialize(writer, value, value.GetType(), options);
      }

      private static object ToDynamic(JsonElement element)
      {
        switch (element.ValueKind)
        {
          case JsonValueKind.Object:
            var expando = new ExpandoObject() as IDictionary<string, object>;
            foreach (var property in element.EnumerateObject())
            {
              expando[property.Name] = ToDynamic(property.Value);
            }

            return expando;

          case JsonValueKind.Array:
            var list = new List<object>();
            foreach (var item in element.EnumerateArray())
            {
              list.Add(ToDynamic(item));
            }

            return list;

          case JsonValueKind.String:
            if (element.TryGetDateTime(out var dateTime))
            {
              return dateTime;
            }

            if (element.TryGetGuid(out var guid))
            {
              return guid;
            }

            return element.GetString();

          case JsonValueKind.Number:
            if (element.TryGetInt64(out var longValue))
            {
              if (longValue >= int.MinValue && longValue <= int.MaxValue)
              {
                return (int)longValue;
              }

              return longValue;
            }

            return element.GetDouble();

          case JsonValueKind.True:
          case JsonValueKind.False:
            return element.GetBoolean();

          case JsonValueKind.Null:
          case JsonValueKind.Undefined:
            return null;

          default:
            return null;
        }
      }
    }
  }
}
