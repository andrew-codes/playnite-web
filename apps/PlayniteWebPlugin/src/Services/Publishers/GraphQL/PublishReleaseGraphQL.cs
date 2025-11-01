using GraphQL.Client.Http;
using Playnite.SDK.Models;
using PlayniteWeb.Services.Publishers.GraphQL;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.WebSocket
{
  public class PublishReleaseGraphQL : IPublishToPlayniteWeb<IIdentifiable>
  {
    private readonly GraphQLHttpClient gql;
    private readonly string deviceId;
    private readonly PlayniteWebSettings settings;

    public PublishReleaseGraphQL(GraphQLHttpClient gql, string deviceId, PlayniteWebSettings settings)
    {
      this.gql = gql;
      this.deviceId = deviceId;
      this.settings = settings;
    }

    public IEnumerable<Task> Publish(IEnumerable<IIdentifiable> entities)
    {
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
            update = new
            {
              releases = entities
               .Select(g => {
                 ReleaseDate? releaseDate = (ReleaseDate)g.GetValue("ReleaseDate");

                 return new
                 {
                   id = g.Id,
                   title = g.GetValue("Name"),
                   //criticScore = g.GetValue("CriticScore"),
                   description = g.GetValue("Description"),
                   source = g.GetValue("SourceId"),
                   completionStatus = g.GetValue("CompletionStatusId"),
                   hidden = g.GetValue("Hidden"),
                   features = g.GetValue("FeatureIds"),
                   tags = g.GetValue("TagIds"),
                   //genres = g.Genres.Select(ge => ge.Id),
                   //categories = g.Categories.Select(c => c.Id),
                   releaseDate = releaseDate.HasValue ? releaseDate.Value.Date.ToString("yyyy-MM-ddTHH:mm:ss.fffZ", CultureInfo.InvariantCulture) : (string)null,
                   playtime = g.GetValue("Playtime"),
                 };
               }),
              platforms = Enumerable.Empty<object>(),
              sources = Enumerable.Empty<object>(),
              tags = Enumerable.Empty<object>(),
              completionStates = Enumerable.Empty<object>(),
              features = Enumerable.Empty<object>(),
            },
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
  }
}
