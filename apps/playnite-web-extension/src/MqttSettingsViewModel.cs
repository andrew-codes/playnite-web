using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using Playnite.SDK;
using Playnite.SDK.Data;
using Playnite.SDK.Plugins;

namespace PlayniteWebExtension.UI
{

  public class MqttPluginSettingsViewModel : ObservableObject, ISettings, IMqttSettings
  {
    private readonly Plugin plugin;

    private PluginSettings settings;
    public PluginSettings Settings
    {
      get => settings;
      set
      {
        settings = value;
        OnPropertyChanged();
      }
    }
    private PluginSettings editingClone { get; set; }

    public string ClientId => ((IMqttSettings)settings).ClientId;

    public string DeviceName => ((IMqttSettings)settings).DeviceName;

    public string DeviceId => ((IMqttSettings)settings).DeviceId;

    public string ServerAddress => ((IMqttSettings)settings).ServerAddress;

    public string Username => ((IMqttSettings)settings).Username;

    public string HomeAssistantTopic => ((IMqttSettings)settings).HomeAssistantTopic;

    public string Password => Encoding.UTF8.GetString(ProtectedData.Unprotect(settings.Password, plugin.Id.ToByteArray(), DataProtectionScope.CurrentUser));

    public int? Port => ((IMqttSettings)settings).Port;

    public bool UseSecureConnection => ((IMqttSettings)settings).UseSecureConnection;

    public bool PublishCoverColors => ((IMqttSettings)settings).PublishCoverColors;

    public bool PublishCover => ((IMqttSettings)settings).PublishCover;

    public bool PublishBackground => ((IMqttSettings)settings).PublishBackground;

    public MqttPluginSettingsViewModel(Plugin plugin)
    {
      // Injecting your plugin instance is required for Save/Load method because Playnite saves data to a location based on what plugin requested the operation.
      this.plugin = plugin;

      // Load saved settings.
      var savedSettings = plugin.LoadPluginSettings<PluginSettings>();

      // LoadPluginSettings returns null if not saved data is available.
      if (savedSettings != null)
      {
        Settings = savedSettings;
      }
      else
      {
        Settings = new PluginSettings();
      }
    }

    public void SavePassword(string password)
    {
      settings.Password = ProtectedData.Protect(Encoding.UTF8.GetBytes(password), plugin.Id.ToByteArray(), DataProtectionScope.CurrentUser);
    }

    #region Implementation of IEditableObject

    public void BeginEdit()
    {
      // Code executed when settings view is opened and user starts editing values.
      editingClone = Serialization.GetClone(Settings);
    }

    public void CancelEdit()
    {
      // Code executed when user decides to cancel any changes made since BeginEdit was called.
      // This method should revert any changes made to Option1 and Option2.
      Settings = editingClone;
    }

    public void EndEdit()
    {
      // Code executed when user decides to confirm changes made since BeginEdit was called.
      // This method should save settings made to Option1 and Option2.
      plugin.SavePluginSettings(Settings);
    }

    #endregion

    #region Implementation of ISettings

    public bool VerifySettings(out List<string> errors)
    {
      // Code execute when user decides to confirm changes made since BeginEdit was called.
      // Executed before EndEdit is called and EndEdit is not called if false is returned.
      // List of errors is presented to user if verification fails.
      errors = new List<string>();
      // plugin.StartDisconnect().Wait();
      // plugin.StartConnection();
      return true;
    }

    #endregion
  }
}
