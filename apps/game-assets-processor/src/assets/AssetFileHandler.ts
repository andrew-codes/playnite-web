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

  async persist(release: { title: string }): Promise<[string, string] | void> {
    await fs.mkdir(path.join(this.rootAssetPath, 'game-assets'), {
      recursive: true,
    })

    const ignId = slug(release)
    if (
      existsSync(path.join(this.rootAssetPath, 'game-assets', `${ignId}.webp`))
    ) {
      return
    }

    const imageSource = await this.sourceAssets.source(release)
    if (!imageSource) {
      throw new Error(`No image source found for ${release.title}`)
    }

    const [mimeType, imageData] = imageSource
    logger.debug(`MimeType for ${release.title}: ${mimeType}`)
    const webp = await sharp(imageData)
      .resize(325, 325)
      .toFormat('webp')
      .toBuffer()
    const savePath = path.join(
      this.rootAssetPath,
      'game-assets',
      `${ignId}.webp`,
    )

    logger.debug(`Writing image for ${release.title} to disk`, savePath)
    await fs.writeFile(savePath, webp)

    return [`/public/game-assets/${ignId}.webp`, savePath]
  }
}

export { AssetFileHandler }
