using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Subscribers
{
  internal interface ISubscribeToPlayniteWeb
  {
    event EventHandler<Task> OnUpdateLibrary;
    event EventHandler<Release> OnStartRelease;
    event EventHandler<Release> OnInstallRelease;
    event EventHandler<Release> OnUninstallRelease;
  }
}
