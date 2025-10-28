using System.Threading;

namespace PlayniteWebMqtt.Services.Mqtt
{
  public interface IApplyPublisherOptions<TPublishClient>
  {
    TPublishClient ApplyOptions(TPublishClient client, CancellationToken token = default);
  }
}
