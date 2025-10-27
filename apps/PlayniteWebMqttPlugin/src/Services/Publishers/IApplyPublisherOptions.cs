using System.Threading;

namespace PlayniteWebMqtt.Services.Publishers
{
  public interface IApplyPublisherOptions<TPublishClient>
  {
    TPublishClient ApplyOptions(TPublishClient client, CancellationToken token = default);
  }
}
