using Playnite.SDK.Models;
using System;
using System.Collections.Generic;

public class Release : IIdentifiable
{
  private readonly Game game;
  private readonly Platform platform;

  public Release(Game game, Platform platform)
  {
    this.game = game;
    this.platform = platform;
  }

  public Guid Id => game.Id;
  public string Name => game.Name;
  public string Description => game.Description;
  public string Version => game.Version;
  public string Icon => game.Icon;
  public string CoverImage => game.CoverImage;
  public string BackgroundImage => game.BackgroundImage;
  public string InstallDirectory => game.InstallDirectory;
  public IEnumerable<Company> Developers => game.Developers;
  public IEnumerable<Company> Publishers => game.Publishers;
  public IEnumerable<Genre> Genres => game.Genres;
  public ReleaseDate? ReleaseDate => game.ReleaseDate;
  public Platform Platform => platform;
  public CompletionStatus CompletionStatus => game.CompletionStatus;
  public int? UserScore => game.UserScore;
  public int? CriticScore => game.CriticScore;
  public int? CommunityScore => game.CommunityScore;
  public DateTime? LastActivity => game.LastActivity;
  public ulong Playtime => game.Playtime;
  public DateTime? Added => game.Added;
  public DateTime? Modified => game.Modified;
  public ulong PlayCount => game.PlayCount;
  public IEnumerable<Series> Series => game.Series;
  public IEnumerable<AgeRating> AgeRatings => game.AgeRatings;
  public IEnumerable<Region> Regions => game.Regions;
  public GameSource Source => game.Source;
  public IEnumerable<Tag> Tags => game.Tags;
  public IEnumerable<GameFeature> Features => game.Features;
  public IEnumerable<Link> Links => game.Links;
  public bool IsInstalled => game.IsInstalled;
  public bool IsCustomGame => game.IsCustomGame;
  public bool Hidden => game.Hidden;
  public bool Favorite => game.Favorite;
  public ulong? InstallSize => game.InstallSize;
}
