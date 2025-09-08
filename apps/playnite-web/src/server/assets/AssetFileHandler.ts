import { existsSync } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import logger from '../logger.js'
import { ignSlug } from './ignSlug.js'
import { IPersistAssets, ISourceAssets } from './interfaces'

class AssetFileHandler implements IPersistAssets {
  constructor(
    private rootAssetPath: string,
    private sourceAssets: ISourceAssets,
  ) {}

  async persist(release: { title: string }): Promise<boolean> {
    await fs.mkdir(path.join(this.rootAssetPath, 'game-assets'), {
      recursive: true,
    })

    const ignId = ignSlug(release)
    if (
      existsSync(path.join(this.rootAssetPath, 'game-assets', `${ignId}.webp`))
    ) {
      return true
    }
    logger.debug(path.join(this.rootAssetPath, 'game-assets', `${ignId}.webp`))

    const imageSource = await this.sourceAssets.source(release)
    if (!imageSource) {
      return false
    }

    const [mimeType, imageData] = imageSource
    try {
      const webp = await sharp(imageData)
        .resize(325, 325)
        .toFormat('webp')
        .toBuffer()
      await fs.writeFile(
        path.join(this.rootAssetPath, 'game-assets', `${ignId}.webp`),
        webp,
      )
      return true
    } catch (err) {
      logger.error(`Failed to process image for ${release.title}: ${err}`)
      return false
    }
  }
}

export { AssetFileHandler }
