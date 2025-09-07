using GraphQL.Client.Http;
using Playnite.SDK.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

public enum EntityType
{
  platforms,
  sources,
  tags,
  completionStates,
  features
}

namespace PlayniteWeb.Services.Publishers.WebSocket
{
  public class PublishEntityGraphQL : IPublishToPlayniteWeb<IIdentifiable>
  {
    private readonly GraphQLHttpClient gql;
    private readonly string deviceId;
    private readonly PlayniteWebSettings settings;
    private readonly EntityType type;

    public PublishEntityGraphQL(GraphQLHttpClient gql, string deviceId, PlayniteWebSettings settings, EntityType type)
    {
      this.gql = gql;
      this.deviceId = deviceId;
      this.settings = settings;
      this.type = type;
    }

    public IEnumerable<Task> Publish(IEnumerable<IIdentifiable> entities)
    {
      var update = new Dictionary<string, object> {
        ["releases"] = Enumerable.Empty<object>(),
        ["platforms"] = Enumerable.Empty<object>(),
        ["sources"] = Enumerable.Empty<object>(),
        ["tags"] = Enumerable.Empty<object>(),
        ["completionStates"] = Enumerable.Empty<object>(),
        ["features"] = Enumerable.Empty<object>()
      };

      var key = this.type.ToString();
      if (!update.ContainsKey(key))
      {
        throw new Exception ($"Invalid type specified: {this.type}");
      }

      update[key] = entities.Select(e => new { id = e.Id, name = GetNameProperty(e) });

      yield return gql.SendMutationAsync<dynamic>(new GraphQLHttpRequest
      {
        Query = @"mutation($libraryData: LibraryInput!) {
          syncLibrary(libraryData: $libraryData) {
            id
          }
        }",
        Variables = new
        {
          libraryData = new
          {
            source = deviceId,
            libraryId = deviceId,
            name = settings.DeviceName,
            update,
            remove = new
            {
              releases = Enumerable.Empty<string>(),
              platforms = Enumerable.Empty<string>(),
              sources = Enumerable.Empty<string>(),
              tags = Enumerable.Empty<string>(),
              completionStates = Enumerable.Empty<string>(),
              features = Enumerable.Empty<string>(),
            }
          }
        }
      }).ContinueWith(r =>
      {
        var response = r.Result;
        if (response.Errors != null && response.Errors.Any())
        {
          var graphResponse = response.AsGraphQLHttpResponse();
          throw new HttpRequestException(string.Join(Environment.NewLine, response.Errors.Select(e => e.Message)));
        }
      });
    }

    private object GetNameProperty(IIdentifiable e)
    {
      var nameProperty = e.GetType().GetProperty("Name");
      var name = nameProperty?.GetValue(e)?.ToString();
      if (name == null)
      {
        throw new Exception($"Entity {e.Id} does not have a Name property.");
      }

      return name;
    }
  }
}
