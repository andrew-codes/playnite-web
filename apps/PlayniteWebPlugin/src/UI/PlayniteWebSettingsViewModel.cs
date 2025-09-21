using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Playnite.SDK;
using Playnite.SDK.Data;
using Playnite.SDK.Models;
using Playnite.SDK.Plugins;

namespace PlayniteWeb.UI
{

  public class SourceWithPlatform: ObservableObject
  {
    public Guid Id { get; set; }
    public string Name { get; set; }
    private Guid selectedPlatformId;
    public Guid SelectedPlatformId
    {
      get => selectedPlatformId;
      set => SetValue(ref selectedPlatformId, value);
    }
  }

  public class PlayniteWebSettingsViewModel : ObservableObject, ISettings
  {
    private readonly Plugin plugin;
    private readonly IGameDatabase db;
    private PlayniteWebSettings settings;
    public event EventHandler<PlayniteWebSettings> OnVerifySettings;

    public PlayniteWebSettings Settings
    {
      get => settings;
      set
      {
        settings = value;
        OnPropertyChanged();
      }
    }

    private ObservableCollection<SourceWithPlatform> sources;
    public ObservableCollection<SourceWithPlatform> Sources
    {
      get  {
        if (sources == null)
        {
          InitializeSources();
        }
        return sources;
          }
      set
      {
        sources = value;
        OnPropertyChanged();
      }
    }

    private void InitializeSources()
    {
      sources = new ObservableCollection<SourceWithPlatform>(db.Sources
        .Select(s => new SourceWithPlatform
        {
          Id = s.Id,
          Name = s.Name,
          SelectedPlatformId = settings.SourcePlatforms.ContainsKey(s.Id) ? settings.SourcePlatforms[s.Id] : Guid.Empty
        })
        .OrderBy(s => s.Name));
    }

    public IEnumerable<Platform> Platforms
    {
      get => db.Platforms.OrderBy(p => p.Name);
    }

    private PlayniteWebSettings editingClone { get; set; }

    public PlayniteWebSettingsViewModel(Plugin plugin, IGameDatabase db)
    {
      // Injecting your plugin instance is required for Save/Load method because Playnite saves data to a location based on what plugin requested the operation.
      this.plugin = plugin;
      this.db = db;

      // Load saved settings.
      var savedSettings = plugin.LoadPluginSettings<PlayniteWebSettings>();

      // LoadPluginSettings returns null if not saved data is available.
      if (savedSettings != null)
      {
        Settings = savedSettings;
      }
      else
      {
        Settings = new PlayniteWebSettings();
        Settings.DeviceId = Guid.NewGuid();
      }

#if DEBUG
      // In debug mode, reset the last publish time to null to allow testing.
      Settings.LastPublish = null;
#endif
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
      Settings.SourcePlatforms = Sources.ToDictionary(s => s.Id, s => s.SelectedPlatformId);
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
        OnVerifySettings.Invoke(this, settings);
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
