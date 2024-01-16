using Playnite.SDK.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Publishers
{
  public interface IConnectPublisher<TPublishClient>
  {
    void StartConnection(IApplyPublisherOptions<TPublishClient> options);
    Task StartDisconnect();
  }
}
