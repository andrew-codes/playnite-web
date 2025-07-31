import { IIdentify } from './oid'

interface IHandleAssets {
  persist(
    params: {
      userId: IIdentify
      assetId: IIdentify
      libraryId: IIdentify
    },
    asset: Buffer,
  ): Promise<void>
}

export type { IHandleAssets }
