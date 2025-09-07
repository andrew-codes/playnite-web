interface ISourceAssets {
  source(asset: { title: string }): Promise<[string, Buffer] | null>
}

export type { ISourceAssets }
