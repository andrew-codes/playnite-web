using ImageMagick;
using Playnite.SDK;
using System.IO;

namespace PlayniteWeb.Services.Publishers
{
  public class Asset
  {
    private string filePath;
    private byte[] data;

    public byte[] Data => data;

    public Asset(IGameDatabaseAPI api, string filePath) {
      this.filePath = api.GetFullFilePath(filePath);

          using (var memoryStream = new MemoryStream())
          {
            var image = new MagickImage(this.filePath);
          image.Format = MagickFormat.WebP;
          image.Quality = 75;
          image.Settings.SetDefine(MagickFormat.WebP,"method", "6");
          image.Write(memoryStream, MagickFormat.WebP);
          this.data = memoryStream.ToArray();
          }
    }
  }
}
