using GraphQL.Client.Http;
using Playnite.SDK;
using Playnite.SDK.Plugins;
using System;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.WebSocket
{
  public class PublishLibraryGraphQL
  {
    private readonly GraphQLHttpClient gql;
    private readonly IGameDatabaseAPI db;
    private readonly string deviceId;
    private readonly PlayniteWebSettings settings;
    private readonly Plugin plugin;

    public PublishLibraryGraphQL(GraphQLHttpClient gql, IGameDatabaseAPI db, string deviceId, PlayniteWebSettings settings, Plugin plugin)
    {
      this.gql = gql;
      this.db = db;
      this.deviceId = deviceId;
      this.settings = settings;
      this.plugin = plugin;
    }

    public Task Publish()
    {
      gql.SendMutationAsync<dynamic>(new GraphQLHttpRequest
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
              releases = db.Games
                 .Where(g => !string.IsNullOrEmpty(g.Name) && !string.IsNullOrWhiteSpace(g.Name))
                 .Select(g => new
                 {
                   id = g.Id,
                   title = g.Name,
                   description = g.Description,
                   source = g.SourceId,
                   completionStatus = g.CompletionStatusId,
                   hidden = g.Hidden,
                   features = g.FeatureIds ?? Enumerable.Empty<Guid>(),
                   tags = g.TagIds ?? Enumerable.Empty<Guid>(),
                   //genres = g.Genres.Select(ge => ge.Id),
                   //categories = g.Categories.Select(c => c.Id),
                   releaseDate = !g.ReleaseDate.HasValue ? (string)null : g.ReleaseDate.Value.Date.ToString("yyyy-MM-ddTHH:mm:ss.fffZ", CultureInfo.InvariantCulture),
                   playtime = g.Playtime.ToString(),
                   lastActivity = !g.LastActivity.HasValue ? (string)null : g.LastActivity.Value.Date.ToString("yyyy-MM-ddTHH:mm:ss.fffZ", CultureInfo.InvariantCulture),
                 }),
              platforms = db.Platforms.Select(p => new { id = p.Id, name = p.Name }),
              sources = db.Sources.Select(s => new { id = s.Id, name = s.Name, platform = settings.SourcePlatforms[s.Id] }),
              tags = db.Tags.Select(t => new { id = t.Id, name = t.Name }),
              completionStates = db.CompletionStatuses.Select(c => new { id = c.Id, name = c.Name }),
              features = db.Features.Select(f => new { id = f.Id, name = f.Name }),
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

        settings.LastPublish = DateTime.UtcNow;
        plugin.SavePluginSettings(settings);
      });

      return Task.CompletedTask;
    }
  }
}
