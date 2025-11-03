import logger from 'dev-logger'
import { existsSync } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { slug } from 'sourced-assets'
import { IPersistAssets, ISourceAssets } from './interfaces.js'

class AssetFileHandler implements IPersistAssets {
  constructor(
    private rootAssetPath: string,
    private sourceAssets: ISourceAssets,
  ) {}

  async persist(release: {
    title: string
  }): Promise<Array<[string, string]> | void> {
    await fs.mkdir(path.join(this.rootAssetPath, 'game-assets'), {
      recursive: true,
    })

    const ignId = slug(release)
    const sizes = [175, 230, 280, 320]

    // Check if all sizes exist on disk
    const allSizesExist = sizes.every((size) =>
      existsSync(
        path.join(this.rootAssetPath, 'game-assets', `${ignId}-${size}.webp`),
      ),
    )

    if (allSizesExist) {
      return
    }

    const imageSource = await this.sourceAssets.source(release)
    if (!imageSource) {
      throw new Error(`No image source found for ${release.title}`)
    }

    const [mimeType, imageData] = imageSource
    logger.debug(`MimeType for ${release.title}: ${mimeType}`)

    // Process and save all sizes
    const savePromises = sizes.map(async (size) => {
      const webp = await sharp(imageData)
        .resize(size, size)
        .toFormat('webp')
        .toBuffer()
      const savePath = path.join(
        this.rootAssetPath,
        'game-assets',
        `${ignId}-${size}.webp`,
      )

      logger.debug(
        `Writing ${size}x${size} image for ${release.title} to disk`,
        savePath,
      )
      await fs.writeFile(savePath, webp)
      return [`${ignId}-${size}.webp`, savePath] as [string, string]
    })

    const results = await Promise.all(savePromises)
    return results
  }
}

export { AssetFileHandler }
