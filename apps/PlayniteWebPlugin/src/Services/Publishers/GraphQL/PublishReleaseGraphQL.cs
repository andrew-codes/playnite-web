using GraphQL.Client.Http;
using Playnite.SDK;
using Playnite.SDK.Models;
using PlayniteWeb.Models;
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
    private readonly IGameDatabaseAPI db;
    private readonly string deviceId;
    private readonly PlayniteWebSettings settings;

    public PublishReleaseGraphQL(GraphQLHttpClient gql, IGameDatabaseAPI db, string deviceId, PlayniteWebSettings settings)
    {
      this.gql = gql;
      this.db = db;
      this.deviceId = deviceId;
      this.settings = settings;
    }

    public IEnumerable<Task> Publish(IEnumerable<IIdentifiable> entities)
    {
      if (settings.LastPublish == null)
      {
        yield break;
      }

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
            libraryId = deviceId,
            name = settings.DeviceName,
            update = new
            {
              releases = entities
               .Select(g => new
               {
                 id = g.Id,
                 title = GetName(g),
                 description = GetDescription(g),
                 source = GetSourceId(g),
                 completionStatus = GetCompletionStatusId(g),
                 hidden = GetHidden(g),
                 features = GetFeatures(g),
                 tags = GetTagIds(g),
                 //genres = g.Genres.Select(ge => ge.Id),
                 //categories = g.Categories.Select(c => c.Id),
                 releaseDate = GetReleaseDate(g),
                 playTime = GetPlayTime(g)
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

    private object GetName(IIdentifiable e)
    {
      var nameProperty = e.GetType().GetProperty("Name");
      var name = nameProperty?.GetValue(e)?.ToString();
      if (name == null)
      {
        throw new Exception($"Entity {e.Id} does not have a Name property.");
      }

      return name;
    }

    private object GetDescription(IIdentifiable e)
    {
      var descriptionProperty = e.GetType().GetProperty("Description");
      var description = descriptionProperty?.GetValue(e)?.ToString();
      if (description == null)
      {
        return string.Empty;
      }
      return description;
    }

    private object GetSourceId(IIdentifiable e)
    {
      var sourceProperty = e.GetType().GetProperty("SourceId");
      if (sourceProperty == null)
      {
        throw new Exception($"Entity {e.Id} does not have a SourceId property.");
      }
      var sourceId = sourceProperty.GetValue(e);
     
      return sourceId;
    }

    private object GetCompletionStatusId(IIdentifiable e)
    {
      var completionStatusProperty = e.GetType().GetProperty("CompletionStatusId");
      if (completionStatusProperty == null)
      {
        throw new Exception($"Entity {e.Id} does not have a CompletionStatusId property.");
      }
      var completionStatusId = completionStatusProperty.GetValue(e);

      return completionStatusId;
    }

    private object GetHidden(IIdentifiable e)
    {
      var hiddenProperty = e.GetType().GetProperty("Hidden");
      if (hiddenProperty == null)
      {
        throw new Exception($"Entity {e.Id} does not have a Hidden property.");
      }
      var hidden = hiddenProperty.GetValue(e);
      if (hidden == null)
      {
        return false;
      }
      return hidden;
    }

    private object GetFeatures(IIdentifiable e)
    {
      var featuresProperty = e.GetType().GetProperty("FeatureIds");
      if (featuresProperty == null)
      {
        throw new Exception($"Entity {e.Id} does not have a Features property.");
      }
      var features = featuresProperty.GetValue(e) as IEnumerable<Guid>;

      if (features == null)
      {
        return Enumerable.Empty<Guid>();
      }
      return features;
    }

    private object GetTagIds(IIdentifiable e)
    {
      var tagsProperty = e.GetType().GetProperty("TagIds");
      if (tagsProperty == null)
      {
        throw new Exception($"Entity {e.Id} does not have a Tags property.");
      }
      var tags = tagsProperty.GetValue(e) as IEnumerable<Guid>;
      if (tags == null)
      {
        return Enumerable.Empty<Guid>();
      }
      return tags;
    }
    private object GetReleaseDate(IIdentifiable e)
    {
      var releaseDateProperty = e.GetType().GetProperty("ReleaseDate");
      if (releaseDateProperty == null)
      {
        throw new Exception($"Entity {e.Id} does not have a ReleaseDate property.");
      }
      var releaseDate = releaseDateProperty.GetValue(e) as DateTime?;
      if (releaseDate.HasValue)
      {
        return releaseDate.Value.Date.ToString("yyyy-MM-ddTHH:mm:ss.fffZ", CultureInfo.InvariantCulture);
      }
      return null;
    }

    private object GetPlayTime(IIdentifiable e)
    {
      var playTimeProperty = e.GetType().GetProperty("Playtime");
      if (playTimeProperty == null)
      {
        throw new Exception($"Entity {e.Id} does not have a Playtime property.");
      }
      var playTime = playTimeProperty.GetValue(e) as ulong?;
      if (playTime.HasValue)
      {
        return playTime.Value.ToString();
      }
      return null;
    }
  }
}
