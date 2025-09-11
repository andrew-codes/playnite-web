import type { ISourceAssets } from 'sourced-assets'

interface IPersistAssets {
  persist(asset: { title: string }): Promise<boolean>
}

export type { IPersistAssets, ISourceAssets }
