import type { ISourceAssets } from 'sourced-assets'

interface IPersistAssets {
  persist(asset: { title: string }): Promise<Array<[string, string]> | void>
}

export type { IPersistAssets, ISourceAssets }
