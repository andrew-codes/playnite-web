import { Asset } from 'apps/playnite-web/.generated/prisma/client'
import { existsSync } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { IPersistAssets, ISourceAssets } from './interfaces'

class AssetFileHandler implements IPersistAssets {
  constructor(
    private rootAssetPath: string,
    private sourceAssets: ISourceAssets,
  ) {}

  async persist(asset: Asset): Promise<void> {
    await fs.mkdir(path.join(this.rootAssetPath, 'game-assets'), {
      recursive: true,
    })
    if (
      existsSync(
        path.join(this.rootAssetPath, 'game-assets', `${asset.ignId}.webp`),
      )
    ) {
      return
    }

    const imageSource = await this.sourceAssets.source(asset)
    if (!imageSource) {
      return
    }

    const [mimeType, imageData] = imageSource
    const webp = await sharp(imageData).toFormat('webp').toBuffer()
    await fs.writeFile(
      path.join(this.rootAssetPath, 'game-assets', `${asset.ignId}.webp`),
      webp,
    )
  }
}

export { AssetFileHandler }
