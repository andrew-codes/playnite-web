using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Subscribers
{
  internal interface ISubscribeToPlayniteWeb
  {
    event EventHandler<Task> OnLibraryRequest;
    event EventHandler<Guid> OnStartGameRequest;
    event EventHandler<Guid> OnInstallGameRequest;
    event EventHandler<Guid> OnUninstallGameRequest;
  }
}
