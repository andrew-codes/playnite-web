import fs from 'fs/promises'
import path from 'path'
import { IHandleAssets } from './IHandleAssets'
import { IIdentify } from './oid'

class AssetFileHandler implements IHandleAssets {
  constructor(private rootAssetPath: string) {}

  async persist(
    params: {
      userId: IIdentify
      assetId: IIdentify
      libraryId: IIdentify
    },
    asset,
  ): Promise<void> {
    await fs.mkdir(
      path.join(
        this.rootAssetPath,
        params.userId.toString().replace(':', '-'),
        params.libraryId.toString().replace(':', '-'),
      ),
      { recursive: true },
    )
    await fs.writeFile(
      path.join(
        this.rootAssetPath,
        params.userId.toString().replace(':', '-'),
        params.libraryId.toString().replace(':', '-'),
        `${params.assetId.id}.webp`,
      ),
      asset,
    )
  }
}
export { AssetFileHandler }
