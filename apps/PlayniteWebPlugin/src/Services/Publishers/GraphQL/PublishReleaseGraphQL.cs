using GraphQL.Client.Http;
using Playnite.SDK;
using Playnite.SDK.Models;
using PlayniteWeb.Models;
using PlayniteWeb.TopicManager;
using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers.WebSocket
{
  public class PublishReleaseGraphQL:IPublishToPlayniteWeb
  {
    private readonly GraphQLHttpClient ws;
    private readonly IManageTopics topicBuilder;
    private readonly ISerializeObjects serializer;
    private readonly IGameDatabaseAPI gameDatabase;
    private readonly string deviceId;

    public PublishReleaseGraphQL(GraphQLHttpClient gql, IManageTopics topicBuilder, ISerializeObjects serializer, IGameDatabaseAPI gameDatabase, string deviceId)
    {
      this.ws = gql;
      this.topicBuilder = topicBuilder;
      this.serializer = serializer;
      this.gameDatabase = gameDatabase;
      this.deviceId = deviceId;
    }

    public IEnumerable<Task> Publish(IIdentifiable release)
    {
      if (release is Release r)
      {
        //var topic = topicBuilder.GetPublishTopic(PublishTopics.Release(r.Id));

        //var message = new {
        //  type= topic,
        //  payload =new EntityUpdatePayload<Release>(EntityUpdateAction.Update, deviceId) {  Entity = r }
        //};

        //yield return ws.SendAsync(
        //  new ArraySegment<byte>(Encoding.UTF8.GetBytes(serializer.Serialize(message))),
        //  WebSocketMessageType.Text,
        //  true,
        //  default
        //);
      }
      yield return null;
    }
  }
}
