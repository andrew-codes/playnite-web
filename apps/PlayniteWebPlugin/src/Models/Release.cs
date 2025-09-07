using Playnite.SDK.Data;
using Playnite.SDK.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace PlayniteWeb.Models
{
  public enum RunState
  {
    Running,
    Installed,
    Uninstalled
  }

  public class Release : IIdentifiable
  {
    private readonly Playnite.SDK.Models.Game game;
    private readonly Platform platform;
    private readonly GameSource source;

    [DontSerialize]
    public Platform Platform => platform;

    [DontSerialize]
    public IEnumerable<Tag> Tags => game.Tags;

    public Release(Playnite.SDK.Models.Game game, Platform platform)
    {
      this.game = game;
      this.platform = platform;
    }

    public Release(Playnite.SDK.Models.Game game, Platform platform, GameSource source)
    {
      this.game = game;
      this.platform = platform;
      this.source = source;
    }

    [DontSerialize]
    public RunState RunState
    {
      get
      {
        if (game.IsRunning)
        {
          return RunState.Running;
        }
        else if (game.IsInstalled)
        {
          return RunState.Installed;
        }
        else
        {
          return RunState.Uninstalled;
        }
      }
    }
    public int? ProcessId { get; set; }
    public Guid Id => game.Id;
    public string Name => game.Name;
    public string Description => game.Description;
    public string Version => game.Version;
    public string Icon => game.Icon;
    public string CoverImage => game.CoverImage;
    public string BackgroundImage => game.BackgroundImage;
    public string InstallDirectory => game.InstallDirectory;
    public IEnumerable<Guid> DeveloperIds => game.Developers?.Select(item => item.Id) ?? new List<Guid>();
    public IEnumerable<Guid> PublisherIds => game.Publishers?.Select(item => item.Id) ?? new List<Guid>();
    public IEnumerable<Guid> GenreIds => game.Genres?.Select(item => item.Id) ?? new List<Guid>();
    public ReleaseDate? ReleaseDate => game.ReleaseDate;
    public int? ReleaseYear => game.ReleaseDate?.Date.Year;
    public Guid PlatformId => platform.Id;
    public Guid CompletionStatusId => game.CompletionStatus?.Id ?? Guid.Empty;
    public int? UserScore => game.UserScore;
    public int? CriticScore => game.CriticScore;
    public int? CommunityScore => game.CommunityScore;
    public DateTime? LastActivity => game.LastActivity;
    public ulong Playtime => game.Playtime;
    public string GameId => game.GameId;
    public DateTime? Added => game.Added;
    public DateTime? Modified => game.Modified;
    public ulong PlayCount => game.PlayCount;
    public IEnumerable<Guid> SeriesIds => game.Series?.Select(item => item.Id) ?? new List<Guid>();
    public IEnumerable<Guid> AgeRatingIds => game.AgeRatings?.Select(item => item.Id) ?? new List<Guid>();
    public IEnumerable<Guid> RegionIds => game.Regions?.Select(item => item.Id) ?? new List<Guid>();
    public Guid SourceId
    {
      get
      {
        if (game.Source != null)
        {
          return game.Source.Id;
        }

        return source.Id;
      }
    }
    public IEnumerable<Guid> TagIds => game.Tags?.Select(item => item.Id) ?? new List<Guid>();
    public IEnumerable<Guid> FeatureIds => game.Features?.Select(item => item.Id) ?? new List<Guid>();
    public IEnumerable<Link> Links => game.Links;
    public bool IsInstalled => game.IsInstalled;
    public bool IsCustomGame => game.IsCustomGame;
    public bool Hidden => game.Hidden;
    public bool Favorite => game.Favorite;
    public ulong? InstallSize => game.InstallSize;
  }
}
