interface ISourceAssets {
  getImageUrl(release: { title: string }): Promise<string | null>
}

export type { ISourceAssets }
