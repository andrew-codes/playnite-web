using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Playnite.SDK;
using Playnite.SDK.Data;
using Playnite.SDK.Plugins;

namespace PlayniteWebMqtt.UI
{

  public class PlayniteWebMqttSettingsViewModel : ObservableObject, ISettings
  {
    private readonly Plugin plugin;
    private PlayniteWebMqttSettings settings;
    public event EventHandler<PlayniteWebMqttSettings> OnVerifySettings;

    public PlayniteWebMqttSettings Settings
    {
      get => settings;
      set
      {
        settings = value;
        OnPropertyChanged();
      }
    }
    private PlayniteWebMqttSettings editingClone { get; set; }

    public PlayniteWebMqttSettingsViewModel(Plugin plugin)
    {
      // Injecting your plugin instance is required for Save/Load method because Playnite saves data to a location based on what plugin requested the operation.
      this.plugin = plugin;

      // Load saved settings.
      var savedSettings = plugin.LoadPluginSettings<PlayniteWebMqttSettings>();

      // LoadPluginSettings returns null if not saved data is available.
      if (savedSettings != null)
      {
        Settings = savedSettings;
      }
      else
      {
        Settings = new PlayniteWebMqttSettings();
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
      try
      {
        OnVerifySettings?.Invoke(this, settings);
      }
      catch (Exception e)
      {
        errors.Add(e.Message);
      }

      return !errors.Any();
    }

    #endregion
  }
}
