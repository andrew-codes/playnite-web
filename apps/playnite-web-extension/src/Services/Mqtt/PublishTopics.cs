namespace PlayniteWebExtension.Services.Mqtt
{
  public static class PublishTopics
  {
    public const string HomeAssistantSubTopic = "playnite";

    public const string InstalledDataSubTopic = "installed/data";

    public const string CurrentTopic = "current";

    public const string SelectedGameTopic = "selected_game";

    public const string SelectedGameCoverTopic = "selected_game_cover";

    public const string CurrentCoverTopic = "current_cover";

    public const string CurrentBackgroundTopic = "current_background";

    public const string CurrentIconTopic = "current_icon";

    public const string SelectedGameCoverSubTopic = "selected_game/cover";

    public const string CurrentStateSubTopic = "current/state";

    public const string CurrentAttributesSubTopic = "current/attributes";

    public const string CurrentCoverSubTopic = "current/cover";

    public const string CurrentBackgroundSubTopic = "current/background";

    public const string CurrentIconSubTopic = "current/icon";

    public const string UninstalledDataSubTopic = "uninstalled/data";

    public const string SelectedGameStatusSubTopic = "selected_game/status";

    public const string SelectedGameAttributesSubTopic = "selected_game/attributes";

    public const string SelectedGameCommandsSubTopic = "selected_game/commands";

    public const string ConnectionSubTopic = "connection";

    public const string ActiveViewSubTopic = "active_view";

    public const string ActiveViewCommandSubTopic = "active_view/commands";

    public const string GameSubTopic = "game";
    public const string Platform = "platform";
  }
}
