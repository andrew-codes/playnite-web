interface IPersistAssets {
  persist(asset: { title: string }): Promise<void>
}

interface ISourceAssets {
  source(asset: { title: string }): Promise<[string, Buffer] | null>
}

export type { IPersistAssets, ISourceAssets }
