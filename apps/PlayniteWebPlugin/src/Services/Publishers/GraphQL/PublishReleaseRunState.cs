using GraphQL.Client.Http;
using Playnite.SDK.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.WebSocket
{
  public class PublishReleaseRunState 
  {
    private readonly GraphQLHttpClient gql;
    private readonly string deviceId;
    private readonly PlayniteWebSettings settings;

    public PublishReleaseRunState(GraphQLHttpClient gql, string deviceId, PlayniteWebSettings settings)
    {
      this.gql = gql;
      this.deviceId = deviceId;
      this.settings = settings;
    }

    public Task Publish(Game game)
    {
      return gql.SendMutationAsync<dynamic>(new GraphQLHttpRequest
      {
        Query = @"mutation($releaseInput: ReleaseInput!) {
          updateRelease(releaseInput: releaseInput) {
            id
          }
        }",
        Variables = new
        {
          releaseInput= new {
            id = game.Id,
            runState = game.IsRunning == true || game.IsLaunching ? "running" : "stopped",
          },
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
