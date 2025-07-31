using GraphQL.Client.Http;
using Playnite.SDK;
using Playnite.SDK.Models;
using PlayniteWeb.Models;
using PlayniteWeb.TopicManager;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.WebSocket
{
  public class PublishLibraryGraphQL
  {
    private readonly GraphQLHttpClient gql;
    private readonly IGameDatabaseAPI db;
    private readonly string deviceId;
    private readonly PlayniteWebSettings settings;

    public PublishLibraryGraphQL(GraphQLHttpClient gql, IGameDatabaseAPI db, string deviceId, PlayniteWebSettings settings)
    {
      this.gql = gql;
      this.db = db;
      this.deviceId = deviceId;
      this.settings = settings;
    }

    public async void Publish()
    {

      var gameCoverArt = db.Games
        .Where(g => !string.IsNullOrEmpty(g.CoverImage) && !string.IsNullOrWhiteSpace(g.CoverImage) && File.Exists(db.GetFullFilePath(g.CoverImage)))
        .Select(g => new { id = g.Id, type = "cover", data = new Asset(db, g.CoverImage).Data });


      var response = await gql.SendMutationAsync<dynamic>(new GraphQLHttpRequest
      {
        Query = @"mutation($libraryData: LibraryInput!) {
          syncLibrary(libraryData: $libraryData) {
            id
          }
        }",
        Variables = new {
          libraryData = new {
            libraryId = deviceId,
            name = settings.DeviceName,
            update = new
            {
              releases = db.Games
                .Where(g => !string.IsNullOrEmpty(g.Name) && !string.IsNullOrWhiteSpace(g.Name))
                .Select(g => new {
                  id = g.Id,
                  title = g.Name,
                  description = g.Description,
                  //coverImage = g.CoverImage,
                  //backgroundImage = g.BackgroundImage,
                  source = g.SourceId,
                  completionStatus = g.CompletionStatusId,
                  hidden = g.Hidden,
                  features = g.FeatureIds ?? Enumerable.Empty<Guid>(),
                  tags = g.TagIds ?? Enumerable.Empty<Guid>(),
                  //genres = g.Genres.Select(ge => ge.Id),
                  //categories = g.Categories.Select(c => c.Id),
                  releaseDate = !g.ReleaseDate.HasValue ? (string)null : g.ReleaseDate.Value.Date.ToString("yyyy-MM-dd"),
                  playTime = g.Playtime.ToString(),
                }),
              platforms = db.Platforms.Select(p => new { id = p.Id, name = p.Name }),
              sources = db.Sources.Select(s => new { id = s.Id, name = s.Name, platform = settings.SourcePlatforms[s.Id] }),
              tags = db.Tags.Select(t => new { id = t.Id, name = t.Name }),
              completionStates = db.CompletionStatuses.Select(c => new { id = c.Id, name = c.Name }),
              features = db.Features.Select(f => new { id = f.Id, name = f.Name }),
              assets = gameCoverArt
            },
            remove = new
            {
              releases = Enumerable.Empty<string>(),
              platforms = Enumerable.Empty<string>(),
              sources = Enumerable.Empty<string>(),
              tags = Enumerable.Empty<string>(),
              completionStates = Enumerable.Empty<string>(),
              features = Enumerable.Empty<string>(),
              assets = Enumerable.Empty<ByteArrayContent>()
            }
          }
        }
      });

      if (response.Errors != null && response.Errors.Any())
      {
        var errorMessage = string.Join(", ", response.Errors.Select(e => e.Message));
      }
    }
  }
}
