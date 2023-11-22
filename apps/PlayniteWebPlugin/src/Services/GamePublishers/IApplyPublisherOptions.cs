using System.Threading;

namespace PlayniteWeb
{
  public interface IApplyPublisherOptions<TPublishClient>
  {
    TPublishClient ApplyOptions(TPublishClient client, CancellationToken token = default);
  }
}
