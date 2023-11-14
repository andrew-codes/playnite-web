using Playnite.SDK;
using Playnite.SDK.Events;
using Playnite.SDK.Plugins;
using System;
using System.Collections.Generic;
using System.Windows.Controls;

namespace PlayniteWebPlugin
{
    public class WebPlugin : GenericPlugin
    {
        private static readonly ILogger logger = LogManager.GetLogger();

        private readonly List<MainMenuItem> mainMenuItems;

        private readonly List<SidebarItem> sidebarItems;


        public WebPlugin(IPlayniteAPI api) : base(api)
        {

            sidebarItems = new List<SidebarItem>
            {
            };
            mainMenuItems = new List<MainMenuItem>
            {

            };
        }


        #region Overrides of Plugin

        public override Guid Id { get; } = Guid.Parse("6d116e57-cebb-4ef0-a1ed-030a8aa6a7e7");

        public override void OnLibraryUpdated(OnLibraryUpdatedEventArgs args)
        {

        }

        public override void Dispose()
        {
            base.Dispose();
        }

        public override void OnGameInstalled(OnGameInstalledEventArgs args)
        {
        }

        public override void OnGameStarted(OnGameStartedEventArgs args)
        {
           }

        public override void OnGameStarting(OnGameStartingEventArgs args)
        {
           }

        public override void OnGameStopped(OnGameStoppedEventArgs args)
        {
        }

        public override void OnGameUninstalled(OnGameUninstalledEventArgs args)
        {
            }

        public override void OnApplicationStarted(OnApplicationStartedEventArgs args)
        {

        }

        public override void OnApplicationStopped(OnApplicationStoppedEventArgs args)
        {
          }

        public override IEnumerable<SidebarItem> GetSidebarItems()
        {
            return sidebarItems;
        }

        public override IEnumerable<MainMenuItem> GetMainMenuItems(GetMainMenuItemsArgs args)
        {
            return mainMenuItems;
        }

        public override ISettings GetSettings(bool firstRunSettings)
        {
            throw new NotImplementedException();
        }

        public override UserControl GetSettingsView(bool firstRunSettings)
        {
            throw new NotImplementedException();
        }

        #endregion
    }
}
