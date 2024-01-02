using System.Threading;

namespace PlayniteWeb.Services.Publishers
{
  public interface IApplyPublisherOptions<TPublishClient>
  {
    TPublishClient ApplyOptions(TPublishClient client, CancellationToken token = default);
  }
}
