using PlayniteWebMqtt.Models;
using System;

namespace PlayniteWebMqtt.Services.Subscribers
{
  internal interface ISubscribeToPlayniteWeb
  {
    event EventHandler<ReleasePlatform> OnStartRelease;
    event EventHandler<ReleasePlatform> OnInstallRelease;
    event EventHandler<ReleasePlatform> OnUninstallRelease;
    event EventHandler<ReleasePlatform> OnStopRelease;
    event EventHandler<ReleasePlatform> OnRestartRelease;
  }
}
