using PlayniteWeb.Models;
using System;
using System.Threading.Tasks;

namespace PlayniteWeb.Services.Subscribers
{
  internal interface ISubscribeToPlayniteWeb
  {
    event EventHandler<Task> OnUpdateLibrary;
    event EventHandler<Release> OnStartRelease;
    event EventHandler<Release> OnInstallRelease;
    event EventHandler<Release> OnUninstallRelease;
    event EventHandler<Release> OnStopRelease;
    event EventHandler<Release> OnRestartRelease;
    event EventHandler<UpdateEntity> OnUpdateEntity;
  }
}
