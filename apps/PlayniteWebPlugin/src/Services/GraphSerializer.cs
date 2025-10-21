using GraphQL;
using GraphQL.Client.Abstractions.Websocket;
using Playnite.SDK;
using System;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace PlayniteWeb.Services
{
  internal class GraphSerializer : IGraphQLWebsocketJsonSerializer
  {
    private JsonSerializerOptions _options;

    public GraphSerializer() {
            _options = new JsonSerializerOptions(JsonSerializerDefaults.Web)
            {
              Converters = { new TypeConverter() }
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
  }
}
