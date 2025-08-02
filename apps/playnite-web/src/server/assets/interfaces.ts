import { Asset } from 'apps/playnite-web/.generated/prisma/client'

interface IPersistAssets {
  persist(asset: Asset): Promise<void>
}

interface ISourceAssets {
  source(asset: Asset): Promise<[string, Buffer] | null>
}

export type { IPersistAssets, ISourceAssets }
