interface IPersistAssets {
  persist(asset: { title: string }): Promise<boolean>
}

interface ISourceAssets {
  source(asset: { title: string }): Promise<[string, Buffer] | null>
}

export type { IPersistAssets, ISourceAssets }
