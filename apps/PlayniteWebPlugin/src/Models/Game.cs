using Playnite.SDK.Data;
using Playnite.SDK.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace PlayniteWeb.Models
{
  public class Game : IIdentifiable
  {
    private readonly IEnumerable<Release> releases;
    private readonly PlatformSorter platformSorter;
    private readonly List<string> pcSourceNames;
    private readonly List<string> pcPlatformNames;
    private readonly List<string> xboxPlatformNames;
    private readonly List<string> nintendoPlatformNames;
    private readonly Guid id;

    [DontSerialize]
    public IEnumerable<Release> Releases => releases;

    public Guid Id => id;
    public IEnumerable<Guid> ReleaseIds => releases.Select(item => item.Id);
    public string Name => releases.FirstOrDefault()?.Name ?? String.Empty;
    public string Description => releases.FirstOrDefault()?.Description ?? String.Empty;
    public string Cover => releases.FirstOrDefault()?.CoverImage ?? String.Empty;

    public Game(IEnumerable<Playnite.SDK.Models.Game> playniteGames)
    {

      platformSorter = new PlatformSorter();
      pcSourceNames = new List<string> { "Steam", "EA app", "Ubisoft Connect", "Epic", "GOG", "Origin", "UPlay", "Battle.net", "Amazon Games", "Fanatical", "GamersGate", "Humble", "itch.io", "Legacy Games", "Indiegala", "Rockstar Games" };
      pcPlatformNames = new List<string> { ".*PC.*", ".*Macintosh.*", ".*Linux.*" };
      xboxPlatformNames = new List<string> { ".*Xbox.*" };
      nintendoPlatformNames = new List<string> { ".*Nintendo.*", ".*Switch.*", ".*Wii.*", ".*Game ?Cube.*" };

      releases = playniteGames.GroupBy(game => game.Source).SelectMany(GetReleases).ToList();

      using (MD5 md5 = MD5.Create())
      {
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(Name));
        id = new Guid(hash);
      }
    }

    private IEnumerable<Release> GetReleases(IGrouping<GameSource, Playnite.SDK.Models.Game> groupedBySource)
    {
      IList<Platform> publishedPlatforms = new List<Platform>();

      for (int i = 0; i < groupedBySource.Count(); i++)
      {
        Platform platform = null;
        try
        {
          platform = groupedBySource.ElementAt(i).Platforms.Where(p => IsMatchingPlatform(groupedBySource.Key, p)).Where(p => !publishedPlatforms.Any(pp => p.Id == pp.Id)).OrderBy(p => p, platformSorter).First();
        }
        catch { }
        if (platform == null)
        {
          continue;
        }

        publishedPlatforms.Add(platform);
        yield return new Release(groupedBySource.ElementAt(i), platform);
      }
    }

    private bool IsMatchingPlatform(GameSource source, Platform platform)
    {
      if (Regex.IsMatch(source.Name, "playstation", RegexOptions.IgnoreCase))
      {
        return Regex.IsMatch(platform.Name, @".*PlayStation.*", RegexOptions.IgnoreCase);
      }


      if (pcSourceNames.Any(platformName => platformName.ToLower() == source.Name.ToLower()))
      {
        return pcPlatformNames.Any(platformName => Regex.IsMatch(platform.Name, platformName, RegexOptions.IgnoreCase));
      }


      if (Regex.IsMatch(source.Name, "xbox", RegexOptions.IgnoreCase))
      {
        return xboxPlatformNames.Any(platformName => Regex.IsMatch(platform.Name, platformName, RegexOptions.IgnoreCase));
      }


      if (Regex.IsMatch(source.Name, "nintendo", RegexOptions.IgnoreCase))
      {
        return nintendoPlatformNames.Any(platformName => Regex.IsMatch(platform.Name, platformName, RegexOptions.IgnoreCase));
      }

      return false;
    }
  }

  internal class PlatformSorter : IComparer<Platform>
  {

    private IList<string> sortOrder = new List<string> { ".*PC.*", ".*Macintosh.*", ".*Linux.*", ".*PlayStation 5.*", ".*PlayStation 4.*", ".*PlayStation 3.*", ".*PlayStation 2.*", "PlayStation", ".*Xbox Series X", ".*Series S", "Xbox One", "Xbox 360", "Xbox", ".*Switch", ".*Wii U", ".*Wii", ".*Game ?Cube.*", "Nintendo 64.*", "Super Nintendo.*", "Nintendo.*", };

    public int Compare(Platform x, Platform y)
    {
      var xIndex = sortOrder.IndexOf(sortOrder.First(platformName => Regex.IsMatch(x.Name, platformName, RegexOptions.IgnoreCase)));
      var yIndex = sortOrder.IndexOf(sortOrder.First(platformName => Regex.IsMatch(y.Name, platformName, RegexOptions.IgnoreCase)));

      return xIndex.CompareTo(yIndex);
    }
  }
}
